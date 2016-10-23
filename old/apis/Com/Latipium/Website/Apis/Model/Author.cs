// Author.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Com.Latipium.Website.Apis.Model {
	public class Author {
		[Key]
		public long Id {
			get;
			set;
		}

		[ForeignKey("Module")]
		public string Namespace {
			get;
			set;
		}

		public virtual Module Module {
			get;
			set;
		}

		[ForeignKey("User")]
		public string UserId {
			get;
			set;
		}

		public virtual User User {
			get;
			set;
		}
	}
}

