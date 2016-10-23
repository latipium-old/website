// DataContext.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Data.Entity;

namespace Com.Latipium.Website.Honey.Model {
	public class DataContext : DbContext {
		public DbSet<Host> Hosts {
			get;
			set;
		}

		public DbSet<Offence> Offences {
			get;
			set;
		}

		public DbSet<OnlineScanner> OnlineScanners {
			get;
			set;
		}

		public DbSet<Protocol> Protocols {
			get;
			set;
		}
	}
}

