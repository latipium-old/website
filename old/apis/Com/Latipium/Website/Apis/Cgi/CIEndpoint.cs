// CIEndpoint.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using FastCGI;
using Newtonsoft.Json;
using Com.Latipium.Website.Apis.Api;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Cgi {
	[CLSCompliant(false)]
	public class CIEndpoint : IEndpoint {
		private const int UrlLength = 68;
		private byte[] ErrorResponse;
		private Storage Database;

		public void Init(Storage db) {
			Database = db;
			ErrorResponse = Encoding.ASCII.GetBytes(string.Concat(
				"HTTP/1.1 401 Unauthorized\n",
				"Content-Type: text/plain\n",
				"\n"
			)).Concat(Encoding.UTF8.GetBytes("Invalid token"))
				.ToArray();
		}

		public bool CanHandle(string url) {
			return Regex.IsMatch(url, "^/ci/[a-zA-Z0-9]+$");
		}

		public void Handle(Request req, string url) {
			string token = url.Substring(4);
			CIToken ci = Database.Permanent.CITokens.FirstOrDefault(
				             t => t.Id == token);
			if ( ci == null ) {
				req.WriteResponse(ErrorResponse);
				req.Close();
			} else {
				ApiInitRequest data = InitEndpoint.ParseRequest(req);
				if ( data == null ) {
					req.WriteResponse(ErrorResponse);
					req.Close();
				} else {
					List<string> headers = new List<string>();
					ApiResponse res = ApiSubsystem.Process(data, ci, headers);
					req.WriteResponseASCII("HTTP/1.1 200 OK\nContent-Type: application/json\n");
					foreach ( string header in headers ) {
						req.WriteResponseASCII(header);
						req.WriteResponseASCII("\n");
					}
					req.WriteResponseASCII("\n");
					req.WriteResponseUtf8(JsonConvert.SerializeObject(res));
					req.Close();
				}
			}
		}
	}
}

