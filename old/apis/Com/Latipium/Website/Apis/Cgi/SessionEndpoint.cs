// SessionEndpoint.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using FastCGI;
using Newtonsoft.Json;
using Com.Latipium.Website.Apis.Api;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Cgi {
	[CLSCompliant(false)]
	public class SessionEndpoint : IEndpoint {
		public const int UrlLength = 112;
		private Storage Storage;

		public void Init(Storage db) {
			Storage = db;
		}

		public bool CanHandle(string url) {
			return url.Length == UrlLength && Regex.IsMatch(url, "^/session/[A-Za-z0-9]{64}\\?state=[A-Za-z0-9]{32}$");
		}

		public void Handle(Request req, string url) {
			string session = url.Substring(9, 64);
			string state = url.Substring(80, 32);
			string userId;
			if ( Storage.Temporary.Sessions.TryGetValue(session, out userId) ) {
				ApiInitRequest init;
				if ( Storage.Temporary.InitRequests.TryGetValue(state, out init) ) {
					List<string> headers = new List<string>();
					ApiResponse res = ApiSubsystem.Process(init, userId, headers);
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
			} else {
				req.WriteResponseASCII("HTTP/1.1 408 Request Timeout\nContent-Type: text/plain\n\n");
				req.WriteResponseUtf8("Session expired");
			}
			req.Close();
		}
	}
}

