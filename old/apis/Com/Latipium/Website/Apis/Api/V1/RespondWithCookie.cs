// RespondWithCookie.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api.V1 {
	public class RespondWithCookie : ILowLevelApi {
		public Storage Database {
			get;
			set;
		}

		public string Name {
			get {
				return "respondWithCookie";
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
			throw new NotImplementedException("Cannot set cookie without low-level access");
		}

		public object Process(object req, string userId, List<string> headers, out object state) {
			state = req;
			return null;
		}
		public void ProcessResult(List<string> headers, ApiResponse res, object state) {
			headers.Add(string.Concat(
				"Set-Cookie: ",
				(string) state,
				"=",
				JsonConvert.SerializeObject(res),
				"; Expires=",
				DateTime.Now.AddHours(1).ToString("ddd, dd MMM yyyy HH:mm:ss K"),
				"; Domain=latipium.com; Path=/"
			));
		}
	}
}

