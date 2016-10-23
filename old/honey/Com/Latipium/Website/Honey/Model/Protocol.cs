// Protocol.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.ComponentModel.DataAnnotations;

namespace Com.Latipium.Website.Honey.Model {
	public class Protocol {
		[Key]
		public int Id {
			get;
			set;
		}

		public string Name {
			get;
			set;
		}

		public int StandardPort {
			get;
			set;
		}

		public int InternalPort {
			get;
			set;
		}
	}
}

