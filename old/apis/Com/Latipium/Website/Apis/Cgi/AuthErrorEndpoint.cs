// AuthErrorEndpoint.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Linq;
using System.Text;
using FastCGI;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Cgi {
	[CLSCompliant(false)]
	public class AuthErrorEndpoint : IEndpoint {
		private byte[] response;

		public void Init(Storage db) {
			response = Encoding.ASCII.GetBytes(string.Concat(
				"HTTP/1.1 401 Unauthorized\n",
				"Content-Type: text/plain\n",
				"\n"
			)).Concat(Encoding.UTF8.GetBytes("Authentication failure"))
				.ToArray();
		}

		public bool CanHandle(string url) {
			return url.Equals("/callback?error=access_denied");
		}

		public void Handle(Request req, string url) {
			req.WriteResponse(response);
			req.Close();
		}
	}
}

