// Redirect.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Text;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api.V1 {
	public class Redirect : ILowLevelApi {
		public Storage Database {
			get;
			set;
		}

		public string Name {
			get {
				return "redirect";
			}
		}

		public int Version {
			get {
				return 1;
			}
		}

		public Type RequestType {
			get {
				return typeof(string);
			}
		}

		public object Process(object req, string userId) {
			throw new NotImplementedException("Cannot redirect without low-level access");
		}

		public object Process(object req, string userId, List<string> headers, out object state) {
			headers.Add(string.Concat("Location: ", (string) req));
			state = null;
			return null;
		}

		public void ProcessResult(List<string> headers, ApiResponse res, object state) {
		}
	}
}

