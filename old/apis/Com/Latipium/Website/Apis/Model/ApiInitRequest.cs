// ApiInitRequest.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;

namespace Com.Latipium.Website.Apis.Model {
	public class ApiInitRequest {
		public int version;
		public bool session;
		public List<ApiQuery> queries;

		public ApiInitRequest() {
			queries = new List<ApiQuery>();
		}
	}
}

