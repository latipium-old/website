// DataContext.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Data.Entity;
using System.Data.Entity.Core;
using System.Linq;

namespace Com.Latipium.Website.Apis.Model {
	public class DataContext : DbContext {
		public DbSet<User> Users {
			get;
			set;
		}

		public DbSet<Profile> Profiles {
			get;
			set;
		}

		public DbSet<Author> Authors {
			get;
			set;
		}

		public DbSet<Module> Modules {
			get;
			set;
		}

		public DbSet<CIToken> CITokens {
			get;
			set;
		}

		public void ActiveLoad() {
			Users.ToArray();
			Profiles.ToArray();
			Authors.ToArray();
			Modules.ToArray();
			CITokens.ToArray();
		}
	}
}

