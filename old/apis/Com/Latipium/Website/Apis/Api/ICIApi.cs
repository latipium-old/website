// ICIApi.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api {
	public interface ICIApi : IApi {
		object Process(object req, CIToken token);
	}
}

