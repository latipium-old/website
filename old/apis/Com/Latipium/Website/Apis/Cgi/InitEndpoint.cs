// InitEndpoint.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Linq;
using System.Text;
using System.Web;
using FastCGI;
using Newtonsoft.Json;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Cgi {
	[CLSCompliant(false)]
	public class InitEndpoint : IEndpoint {
		private byte[] NoSessionResponse;
		private byte[] SessionResponse;
		private byte[] ResponseEnd;
		private byte[] ErrorResponse;
		private Storage Database;

		public void Init(Storage db) {
			NoSessionResponse = Encoding.ASCII.GetBytes(string.Concat(
				"HTTP/1.1 303 See Other\n",
				"Location: https://accounts.google.com/o/oauth2/v2/auth?",
					"response_type=code&",
					"client_id=303017383010-13dj4r21k7t8nbp2b5sko1h0vtm7d4of.apps.googleusercontent.com&",
					"redirect_uri=",
#if DEBUG
						"http%3A%2F%2F",
#else
						"https%3A%2F%2F",
#endif
						"apis.latipium.com%2Fcallback&",
					"scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&",
					"state="
			));
			SessionResponse = Encoding.ASCII.GetBytes(string.Concat(
				"HTTP/1.1 200 OK\n",
				"Content-Type: text/plain\n",
				"\n"
			));
			ResponseEnd = Encoding.ASCII.GetBytes("\n\n");
			ErrorResponse = Encoding.ASCII.GetBytes(string.Concat(
				"HTTP/1.1 400 Bad Request\n",
				"Content-Type: text/plain\n",
				"\n"
			)).Concat(Encoding.UTF8.GetBytes("Bad Request"))
				.ToArray();
			Database = db;
		}

		public bool CanHandle(string url) {
			return url.Equals("/init");
		}

		public static ApiInitRequest ParseRequest(Request req) {
			string body = req.GetBody(Encoding.UTF8);
			if ( body.StartsWith("_=") ) {
				body = HttpUtility.UrlDecode(body.Substring(2));
			}
			return JsonConvert.DeserializeObject<ApiInitRequest>(body);
		}

		public void Handle(Request req, string url) {
			ApiInitRequest data = ParseRequest(req);
			if ( data != null ) {
				string token = new CryptoInsecureToken(32);
				Database.Temporary.InitRequests.Add(token, data);
				req.WriteResponse(data.session ? SessionResponse : NoSessionResponse);
				req.WriteResponseASCII(token);
				if ( !data.session ) {
					req.WriteResponse(ResponseEnd);
				}
			} else {
				req.WriteResponse(ErrorResponse);
			}
			req.Close();
		}
	}
}

