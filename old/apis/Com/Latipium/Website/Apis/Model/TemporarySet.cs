// TemporarySet.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace Com.Latipium.Website.Apis.Model {
	public class TemporarySet<T> : ICollection<T>, IDisposable {
		private readonly Thread Thread;
		private volatile List<T> NewList;
		private volatile List<T> OldList;
		private object Lock;
		protected bool Disposed;
		public readonly int KeepTime;

		public int Count {
			get {
				lock ( Lock ) {
					return NewList.Count + OldList.Count;
				}
			}
		}

		public bool IsReadOnly {
			get {
				return false;
			}
		}

		public void Add(T item) {
			lock ( Lock ) {
				NewList.Add(item);
			}
		}

		public void Clear() {
			lock ( Lock ) {
				NewList.Clear();
				OldList.Clear();
			}
		}

		public bool Contains(T item) {
			lock ( Lock ) {
				return NewList.Contains(item) || OldList.Contains(item);
			}
		}

		public void CopyTo(T[] array, int arrayIndex) {
			lock ( Lock ) {
				OldList.CopyTo(array, arrayIndex);
				NewList.CopyTo(array, arrayIndex + OldList.Count);
			}
		}

		public bool Remove(T item) {
			lock ( Lock ) {
				return OldList.Remove(item) || NewList.Remove(item);
			}
		}

		public IEnumerator<T> GetEnumerator() {
			return OldList.Concat(NewList).GetEnumerator();
		}

		IEnumerator IEnumerable.GetEnumerator() {
			return GetEnumerator();
		}

		protected virtual void Dispose(bool disposing) {
			if ( Disposed ) {
				return;
			}
			if ( disposing ) {
				Thread.Interrupt();
				Thread.Join();
				Clear();
			}
			Disposed = true;
		}

		public void Dispose() {
			Dispose(true);
			GC.SuppressFinalize(this);
		}

		private void GarbageCollector() {
			try {
				while ( true ) {
					Thread.Sleep(KeepTime);
					lock ( Lock ) {
						OldList = NewList;
						NewList = new List<T>();
					}
				}
			} catch ( ThreadInterruptedException ) {
			}
		}

		public TemporarySet(int keepTime) {
			KeepTime = keepTime;
			Disposed = false;
			Lock = new object();
			NewList = new List<T>();
			OldList = new List<T>();
			Thread = new Thread(GarbageCollector);
			Thread.Start();
		}

		~TemporarySet() {
			Dispose(false);
		}
	}
}

