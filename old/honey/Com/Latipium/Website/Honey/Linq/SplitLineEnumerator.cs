// SplitLineEnumerator.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections;
using System.Collections.Generic;

namespace Com.Latipium.Website.Honey.Linq {
	public class SplitLineEnumerator : IEnumerable<string>, IEnumerator<string> {
		private readonly string[] Words;
		private readonly int Length;
		private int WordIndex;
		private string Line;

		public string Current {
			get {
				return Line;
			}
		}

		object IEnumerator.Current {
			get {
				return Current;
			}
		}

		public bool MoveNext() {
			if ( WordIndex == Words.Length ) {
				return false;
			}
			int len = 0;
			for ( Line = ""; WordIndex < Words.Length; ++WordIndex ) {
				int whitespaceLen = Line.Equals("") ? 0 : 1;
				int wordLen = Words[WordIndex].Length + whitespaceLen;
				if ( (len += wordLen) > Length ) {
					break;
				}
				Line += string.Concat(new string(' ', whitespaceLen), Words[WordIndex]);
			}
			return true;
		}

		public void Reset() {
			WordIndex = 0;
		}

		public void Dispose() {
		}

		public IEnumerator<string> GetEnumerator() {
			SplitLineEnumerator enumerator = new SplitLineEnumerator(Words, Length);
			enumerator.Reset();
			return enumerator;
		}

		IEnumerator IEnumerable.GetEnumerator() {
			return GetEnumerator();
		}

		public SplitLineEnumerator(string[] words, int length) {
			Words = words;
			Length = length;
		}

		public SplitLineEnumerator(string text, int length) {
			Words = text.Split(' ');
			Length = length;
		}
	}
}

