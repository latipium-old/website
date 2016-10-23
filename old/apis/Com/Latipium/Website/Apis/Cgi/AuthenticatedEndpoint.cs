// AuthenticatedEndpoint.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using FastCGI;
using log4net;
using Newtonsoft.Json;
using Com.Latipium.Website.Apis.Api;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Cgi {
	[CLSCompliant(false)]
	public class AuthenticatedEndpoint : IEndpoint {
#if DEBUG
		private static readonly ILog Log = LogManager.GetLogger(typeof(AuthenticatedEndpoint));
#endif
		public const int MaxUrlLength = 128;
		public Uri TokenUri;
		private byte[] ErrorResponse;
		private Storage Storage;

		public void Init(Storage db) {
			TokenUri = new Uri("https://www.googleapis.com/oauth2/v4/token");
			ErrorResponse = Encoding.ASCII.GetBytes(string.Concat(
				"HTTP/1.1 303 See Other\n",
#if DEBUG
				"Location: http://apis.latipium.com/callback?error=access_denied\n",
#else
				"Location: https://apis.latipium.com/callback?error=access_denied\n",
#endif
				"\n"
			));
			Storage = db;
		}

		public bool CanHandle(string url) {
			return url.Length < MaxUrlLength && Regex.IsMatch(url, "^/callback\\?state=[A-Za-z0-9]{32}&code=[A-Za-z0-9_/-]+$");
		}

		private UserInfoResponse RequestUserInfo(TokenResponse token) {
			WebRequest req = WebRequest.Create(new Uri(string.Concat("https://www.googleapis.com/userinfo/v2/me?access_token=", token.access_token)));
			using ( WebResponse res = req.GetResponse() ) {
				using ( Stream stream = res.GetResponseStream() ) {
					using ( TextReader reader = new StreamReader(stream) ) {
						return JsonConvert.DeserializeObject<UserInfoResponse>(reader.ReadToEnd());
					}
				}
			}
		}

		private UserInfoResponse RequestToken(string url, out string state) {
			string _state = null;
			try {
				WebRequest req = WebRequest.Create(TokenUri);
				req.ContentType = "application/x-www-form-urlencoded";
				req.Method = "POST";
				_state = url.Substring(16, 32);
				string code = url.Substring(54, url.Length - 54);
				using ( Stream stream = req.GetRequestStream() ) {
					using ( TextWriter writer = new StreamWriter(stream) ) {
						writer.Write(new TokenRequest(code));
					}
				}
				using ( WebResponse res = req.GetResponse() ) {
					using ( Stream stream = res.GetResponseStream() ) {
						using ( TextReader reader = new StreamReader(stream) ) {
							TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(reader.ReadToEnd());
							return RequestUserInfo(token);
						}
					}
				}
#if DEBUG
			} catch ( Exception ex ) {
				Log.Warn(ex);
#else
			} catch ( Exception ) {
#endif	
				return null;
			} finally {
				state = _state;
			}
		}

		public void Handle(Request req, string url) {
			string state;
			UserInfoResponse info = RequestToken(url, out state);
			if ( info == null ) {
				req.WriteResponse(ErrorResponse);
			} else {
				User user;
				if ( (user = Storage.Permanent.Users.FirstOrDefault(
					u => u.Id == info.id
				)) == null ) {
					user = new User();
					user.Id = info.id;
					Profile profile = new Profile();
					profile.UserId = info.id;
					profile.DisplayName = info.name;
					Storage.Permanent.Profiles.Add(profile);
					Storage.Permanent.Users.Add(user);
				}
				user.Name = info.name;
				user.Email = info.email;
				Storage.Permanent.SaveChanges();
				ApiInitRequest init;
				if ( Storage.Temporary.InitRequests.TryGetValue(state, out init) ) {
					List<string> headers = new List<string>();
					ApiResponse res = ApiSubsystem.Process(init, info.id, headers);
					req.WriteResponseASCII("HTTP/1.1 200 OK\nContent-Type: application/json\n");
					foreach ( string header in headers ) {
						req.WriteResponseASCII(header);
						req.WriteResponseASCII("\n");
					}
					req.WriteResponseASCII("\n");
					req.WriteResponseUtf8(JsonConvert.SerializeObject(res));
				} else {
					req.WriteResponseASCII("HTTP/1.1 408 Request Timeout\nContent-Type: text/plain\n\n");
					req.WriteResponseUtf8("Request timeout");
				}
			}
			req.Close();
		}
	}
}

