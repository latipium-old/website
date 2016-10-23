// OnlineScanner.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Com.Latipium.Website.Honey.Model {
	public class OnlineScanner {
		[Key]
		public int Id {
			get;
			set;
		}

		[ForeignKey("Host")]
		public virtual int HostRefId {
			get;
			set;
		}

		public virtual Host Host {
			get;
			set;
		}
	}
}

