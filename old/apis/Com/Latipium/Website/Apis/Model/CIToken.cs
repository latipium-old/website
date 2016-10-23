// CIToken.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Com.Latipium.Website.Apis.Model {
	public class CIToken {
		[Key]
		public string Id {
			get;
			set;
		}

		[ForeignKey("Module")]
		public string ModuleId {
			get;
			set;
		}

		public virtual Module Module {
			get;
			set;
		}
	}
}

