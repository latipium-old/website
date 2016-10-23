// IBackgroundApi.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;

namespace Com.Latipium.Website.Apis.Api {
	public interface IBackgroundApi : IApi {
		void BackgroundTask();
	}
}

