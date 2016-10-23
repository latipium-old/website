// ApiQuery.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using Newtonsoft.Json;

namespace Com.Latipium.Website.Apis.Model {
	public class ApiQuery {
		public string type;
		public string data;

		protected object Deserialize(Type type) {
			return type == typeof(string) ? data : JsonConvert.DeserializeObject(data, type);
		}

		public T GetData<T>() {
			return string.IsNullOrEmpty(data) ? default(T) : (T) Deserialize(typeof(T));
		}

		public object GetData(Type type) {
			return string.IsNullOrEmpty(data) ? null : Deserialize( type);
		}
	}
}

