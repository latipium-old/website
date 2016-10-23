// NuGetContext.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Data.Entity;

namespace Com.Latipium.Website.Apis.Model {
	public class NuGetContext : DbContext {
		public DbSet<Package> Packages {
			get;
			set;
		}

		public DbSet<PackageVersion> Versions {
			get;
			set;
		}
	}
}

