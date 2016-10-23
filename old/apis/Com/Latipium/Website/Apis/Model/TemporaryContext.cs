// TemporaryContext.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;

namespace Com.Latipium.Website.Apis.Model {
	public class TemporaryContext : IDisposable {
		protected bool Disposed;
		public TemporaryDictionary<string, ApiInitRequest> InitRequests;
		public TemporaryDictionary<string, Upload> Uploads;
		public DoublyLinkedTemporaryDictionary<string, string> Sessions; // token => user
		public DoublyLinkedTemporaryDictionary<string, string> SessionsReverse; // user => token

		protected virtual void Dispose(bool disposing) {
			if ( Disposed ) {
				return;
			}
			if ( disposing ) {
				InitRequests.Dispose();
				Uploads.Dispose();
			}
			Disposed = true;
		}

		public void Dispose() {
			Dispose(true);
			GC.SuppressFinalize(this);
		}

		public TemporaryContext() {
			Disposed = false;
			InitRequests = new TemporaryDictionary<string, ApiInitRequest>(10 * 60 * 1000);
			Uploads = new TemporaryDictionary<string, Upload>(30 * 1000);
			Sessions = new DoublyLinkedTemporaryDictionary<string, string>(7 * 24 * 60 * 60 * 1000);
			SessionsReverse = new DoublyLinkedTemporaryDictionary<string, string>(7 * 24 * 60 * 60 * 1000, Sessions);
		}

		~TemporaryContext() {
			Dispose(false);
		}
	}
}

