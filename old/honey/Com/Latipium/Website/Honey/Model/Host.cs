// Host.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Com.Latipium.Website.Honey.Model {
	public class Host {
		[Key]
		public int Id {
			get;
			set;
		}

		public string Hostname {
			get;
			set;
		}

		public bool IsIP {
			get;
			set;
		}

		public long BanEnd {
			get;
			set;
		}

		public virtual List<Offence> Offences {
			get;
			set;
		}
	}
}

