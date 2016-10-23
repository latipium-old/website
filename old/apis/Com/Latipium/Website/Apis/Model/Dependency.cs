// Dependency.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using Newtonsoft.Json;

namespace Com.Latipium.Website.Apis.Model {
	public class Dependency {
		[JsonProperty("framework")]
		public string Framework;

		[JsonProperty("id")]
		public string Id;

		[JsonProperty("version")]
		public string Version;
	}
}

