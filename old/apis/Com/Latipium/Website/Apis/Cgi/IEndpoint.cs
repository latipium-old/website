// IEndpoint.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using FastCGI;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Cgi {
	[CLSCompliant(false)]
	public interface IEndpoint {
		void Init(Storage db);

		bool CanHandle(string url);

		void Handle(Request req, string url);
	}
}

