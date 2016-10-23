// HelloEndpoint.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using FastCGI;
using Com.Latipium.Website.Apis.Model;

#if DEBUG
namespace Com.Latipium.Website.Apis.Cgi {
	[CLSCompliant(false)]
	public class HelloEndpoint : IEndpoint {
		public void Init(Storage db) {
		}

		public bool CanHandle(string url) {
			return url.Equals("/hello");
		}

		public void Handle(Request req, string url) {
			req.WriteResponseASCII("HTTP/1.1 200 OK\nContent-Type: text/plain\n\n");
			req.WriteResponseUtf8("Hello, world!");
			req.Close();
		}
	}
}
#endif

