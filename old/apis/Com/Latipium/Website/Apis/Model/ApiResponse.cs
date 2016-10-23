// ApiResponse.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;

namespace Com.Latipium.Website.Apis.Model {
	public class ApiResponse {
		public List<ApiQuery> successful_queries;
		public List<ApiQuery> failed_queries;
		public List<object> query_results;

		public ApiResponse() {
			successful_queries = new List<ApiQuery>();
			failed_queries = new List<ApiQuery>();
			query_results = new List<object>();
		}
	}
}

