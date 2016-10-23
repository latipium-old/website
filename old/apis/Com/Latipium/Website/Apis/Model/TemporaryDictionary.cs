// TemporaryDictionary.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace Com.Latipium.Website.Apis.Model {
	public class TemporaryDictionary<TKey, TValue> : IDictionary<TKey, TValue>, IDisposable {
		private readonly Thread Thread;
		private volatile Dictionary<TKey, TValue> NewDictionary;
		private volatile Dictionary<TKey, TValue> OldDictionary;
		private object Lock;
		protected bool Disposed;
		public readonly int KeepTime;

		public int Count {
			get {
				lock ( Lock ) {
					return NewDictionary.Count + OldDictionary.Count;
				}
			}
		}

		public bool IsReadOnly {
			get {
				return false;
			}
		}

		public ICollection<TKey> Keys {
			get {
				lock ( Lock ) {
					return OldDictionary.Keys.Concat(NewDictionary.Keys).ToList();
				}
			}
		}

		public ICollection<TValue> Values {
			get {
				lock ( Lock ) {
					return OldDictionary.Values.Concat(NewDictionary.Values).ToList();
				}
			}
		}

		public virtual TValue this[TKey key] {
			get {
				lock ( Lock ) {
					return OldDictionary.ContainsKey(key) ? OldDictionary[key] : NewDictionary[key];
				}
			}
			set {
				lock ( Lock ) {
					OldDictionary.Remove(key);
					NewDictionary[key] = value;
				}
			}
		}

		public virtual void Add(KeyValuePair<TKey, TValue> item) {
			lock ( Lock ) {
				((ICollection<KeyValuePair<TKey, TValue>>) NewDictionary).Add(item);
			}
		}

		public virtual void Clear() {
			lock ( Lock ) {
				OldDictionary.Clear();
				NewDictionary.Clear();
			}
		}

		public bool Contains(KeyValuePair<TKey, TValue> item) {
			lock ( Lock ) {
				return OldDictionary.Contains(item) || NewDictionary.Contains(item);
			}
		}

		public void CopyTo(KeyValuePair<TKey, TValue>[] array, int arrayIndex) {
			lock ( Lock ) {
				((ICollection<KeyValuePair<TKey, TValue>>) OldDictionary).CopyTo(array, arrayIndex);
				((ICollection<KeyValuePair<TKey, TValue>>) NewDictionary).CopyTo(array, arrayIndex + OldDictionary.Count);
			}
		}

		public virtual bool Remove(KeyValuePair<TKey, TValue> item) {
			lock ( Lock ) {
				return ((ICollection<KeyValuePair<TKey, TValue>>) OldDictionary).Remove(item) || ((ICollection<KeyValuePair<TKey, TValue>>) NewDictionary).Remove(item);
			}
		}

		public IEnumerator<KeyValuePair<TKey, TValue>> GetEnumerator() {
			return OldDictionary.Concat(NewDictionary).GetEnumerator();
		}

		IEnumerator IEnumerable.GetEnumerator() {
			return GetEnumerator();
		}

		public virtual void Add(TKey key, TValue value) {
			lock ( Lock ) {
				NewDictionary.Add(key, value);
			}
		}

		public bool ContainsKey(TKey key) {
			lock ( Lock ) {
				return OldDictionary.ContainsKey(key) || NewDictionary.ContainsKey(key);
			}
		}

		public virtual bool Remove(TKey key) {
			lock ( Lock ) {
				return OldDictionary.Remove(key) || NewDictionary.Remove(key);
			}
		}

		public bool TryGetValue(TKey key, out TValue value) {
			lock ( Lock ) {
				return OldDictionary.TryGetValue(key, out value) || NewDictionary.TryGetValue(key, out value);
			}
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
						OldDictionary = NewDictionary;
						NewDictionary = new Dictionary<TKey, TValue>();
					}
				}
			} catch ( ThreadInterruptedException ) {
			}
		}

		public TemporaryDictionary(int keepTime) {
			KeepTime = keepTime;
			Disposed = false;
			Lock = new object();
			NewDictionary = new Dictionary<TKey, TValue>();
			OldDictionary = new Dictionary<TKey, TValue>();
			Thread = new Thread(GarbageCollector);
			Thread.Start();
		}

		~TemporaryDictionary() {
			Dispose(false);
		}
	}
}

