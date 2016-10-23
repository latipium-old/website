// AddAuthor.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Linq;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api.V1 {
	public class AddAuthor : IApi {
		public class Request {
			public string name;
			public string email;
			public string module;
		}

		public Storage Database {
			get;
			set;
		}

		public string Name {
			get {
				return "addAuthor";
			}
		}

		public int Version {
			get {
				return 1;
			}
		}

		public Type RequestType {
			get {
				return typeof(Request);
			}
		}

		public object Process(object _req, string userId) {
			Request req = (Request) _req;
			if ( req.email == null && req.name == null ) {
				throw new NullReferenceException("Either name or email must be provided");
			}
			User user = Database.Permanent.Users.FirstOrDefault(req.email == null ?
				((Func<User, bool>) (u => u.Name == req.name)) :
				((Func<User, bool>) (u => u.Email == req.email))
			            );
			if ( user == null ) {
				throw new NullReferenceException("User does not exist");
			}
			if ( !Database.Permanent.Authors.Any(
				     a => a.Namespace == req.module && a.UserId == userId
			     ) ) {
				throw new AccessViolationException("Not authorized to add author");
			}
			Author author = new Author();
			author.User = user;
			author.Namespace = req.module;
			Database.Permanent.Authors.Add(author);
			Database.Permanent.SaveChanges();
			return null;
		}
	}
}

