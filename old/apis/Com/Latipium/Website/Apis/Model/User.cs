// User.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Com.Latipium.Website.Apis.Model {
	public class User {
		[Key, ForeignKey("Profile")]
		public string Id {
			get;
			set;
		}

		public string Name {
			get;
			set;
		}

		public string Email {
			get;
			set;
		}

		public virtual Profile Profile {
			get;
			set;
		}
	}
}

