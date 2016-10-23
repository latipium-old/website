// Offence.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Com.Latipium.Website.Honey.Model {
	public class Offence {
		[Key]
		public int Id {
			get;
			set;
		}

		public DateTime Time {
			get;
			set;
		}

		[ForeignKey("Protocol")]
		public virtual int ProtocolRefId {
			get;
			set;
		}

		public virtual Protocol Protocol {
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

