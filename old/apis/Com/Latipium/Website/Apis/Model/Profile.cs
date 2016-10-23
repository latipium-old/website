// Profile.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Com.Latipium.Website.Apis.Model {
	public class Profile {
		[Key]
		public string UserId {
			get;
			set;
		}

		public string DisplayName {
			get;
			set;
		}
	}
}

