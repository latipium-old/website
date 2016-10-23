// IApi.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api {
	public interface IApi {
		Storage Database {
			get;
			set;
		}

		string Name {
			get;
		}

		int Version {
			get;
		}

		Type RequestType {
			get;
		}

		object Process(object req, string userId);
	}
}

