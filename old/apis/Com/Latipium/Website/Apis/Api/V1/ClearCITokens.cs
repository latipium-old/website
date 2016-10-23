// ClearCITokens.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Linq;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api.V1 {
	public class ClearCITokens : IApi {
		public Storage Database {
			get;
			set;
		}

		public string Name {
			get {
				return "clearCITokens";
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
			Module mod = Database.Permanent.Modules.FirstOrDefault(
				m => m.Namespace == (string) req);
			if ( mod == null ) {
				throw new ArgumentException("Namespace is not reserved");
			}
			if ( !Database.Permanent.Authors.Any(
				a => a.UserId == userId && a.Module.Namespace == mod.Namespace) ) {
				throw new AccessViolationException("User does not have permission to publish module");
			}
			if ( Database.Permanent.CITokens.RemoveRange(
				     Database.Permanent.CITokens.Where(
						t => t.Module.Namespace == mod.Namespace
				     )).Any() ) {
				Database.Permanent.SaveChanges();
			}
			return null;
		}
	}
}

