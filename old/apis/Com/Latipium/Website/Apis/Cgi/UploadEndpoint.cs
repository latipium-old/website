// UploadEndpoint.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Linq;
using System.Text;
using FastCGI;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Cgi {
	public class UploadEndpoint : IEndpoint {
		public const int MaxUploadSize = 5 * 1024 * 1024;
		private Storage Database;
		private byte[] SuccessResponse;
		private byte[] TooLargeResponse;

		public void Init(Storage db) {
			Database = db;
			SuccessResponse = Encoding.ASCII.GetBytes(string.Concat(
				"HTTP/1.1 201 Created\n",
				"Content-Type: text/plain\n",
				"\n"
			));
			TooLargeResponse = Encoding.ASCII.GetBytes(string.Concat(
				"HTTP/1.1 413 Payload Too Large\n",
				"Content-Type: text/plain\n",
				"\n"
			)).Concat(Encoding.UTF8.GetBytes("Payload Too Large"))
				.ToArray();
		}

		public bool CanHandle(string url) {
			return url.Equals("/upload");
		}

		[CLSCompliant(false)]
		public void Handle(Request req, string url) {
			Upload upload = new Upload(req.GetBody());
			if ( upload.Data.Length > MaxUploadSize ) {
				req.WriteResponse(TooLargeResponse);
			} else {
				string token = new CryptoInsecureToken(32);
				req.WriteResponse(SuccessResponse);
				req.WriteResponseUtf8(token);
				Database.Temporary.Uploads[token] = upload;
			}
			req.Close();
		}
	}
}

