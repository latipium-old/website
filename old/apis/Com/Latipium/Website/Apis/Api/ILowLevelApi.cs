// ILowLevelApi.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api {
	public interface ILowLevelApi : IApi {
		object Process(object req, string userId, List<string> headers, out object state);

		void ProcessResult(List<string> headers, ApiResponse res, object state);
	}
}

