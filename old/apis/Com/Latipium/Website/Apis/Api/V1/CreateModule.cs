// CreateModule.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Linq;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api.V1 {
	public class CreateModule : IApi {
		private static object Lock = new object();

		public Storage Database {
			get;
			set;
		}

		public string Name {
			get {
				return "createModule";
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
			string name = (string) req;
			Module module = null;
			lock ( Lock ) {
				if ( !Database.Permanent.Modules.Any(
					    m => m.Namespace == name
				    ) ) {
					module = new Module();
					module.Namespace = name;
					Database.Permanent.Modules.Add(module);
					Author author = new Author();
					author.Module = module;
					author.UserId = userId;
					Database.Permanent.Authors.Add(author);
					Database.Permanent.SaveChanges();
				}
			}
			if ( module == null ) {
				throw new Exception("Module already exists");
			} else {
				return null;
			}
		}
	}
}

