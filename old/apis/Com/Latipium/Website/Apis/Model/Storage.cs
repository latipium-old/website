// Storage.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;

namespace Com.Latipium.Website.Apis.Model {
	public class Storage : IDisposable {
		protected bool Disposed;
		public readonly DataContext Permanent;
		public readonly TemporaryContext Temporary;
		public readonly NuGetContext NuGet;

		protected virtual void Dispose(bool disposing) {
			if ( Disposed ) {
				return;
			}
			Permanent.SaveChanges();
			NuGet.SaveChanges();
			if ( disposing ) {
				Permanent.Dispose();
				Temporary.Dispose();
				NuGet.Dispose();
			}
			Disposed = true;
		}

		public void Dispose() {
			Dispose(true);
			GC.SuppressFinalize(this);
		}

		public Storage() {
			Disposed = false;
			Permanent = new DataContext();
			Temporary = new TemporaryContext();
			NuGet = new NuGetContext();
		}

		~Storage() {
			Dispose(false);
		}
	}
}

