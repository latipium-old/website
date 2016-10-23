// EndSession.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Linq;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api.V1 {
	public class EndSession : IApi {
		public Storage Database {
			get;
			set;
		}

		public string Name {
			get {
				return "endSession";
			}
		}

		public int Version {
			get {
				return 1;
			}
		}

		public Type RequestType {
			get {
				return typeof(object);
			}
		}

		public object Process(object req, string userId) {
			Database.Temporary.SessionsReverse.Remove(userId);
			return null;
		}
	}
}

