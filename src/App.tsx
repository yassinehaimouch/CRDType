import React, { useState, useEffect, ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";

// Define types for CRDT class
class CharacterCRDT {
  value: string;
  position: number;
  siteId: string;
  timestamp: number;

  constructor(value: string, position: number, siteId: string) {
    this.value = value;
    this.position = position;
    this.siteId = siteId;
    this.timestamp = Date.now();
  }

  compareTo(other: CharacterCRDT): number {
    if (this.position !== other.position) {
      return this.position - other.position;
    }
    return this.siteId.localeCompare(other.siteId);
  }
}

const App: React.FC = () => {
  const [characters, setCharacters] = useState<CharacterCRDT[]>([]);
  const [siteId] = useState<string>(
    `user-${Math.random().toString(36).substr(2, 9)}`
  );
  const [text, setText] = useState<string>("");

  // Simulate receiving updates from other users
  useEffect(() => {
    const simulateRemoteChanges = (): void => {
      const remoteChanges: CharacterCRDT[] = [
        new CharacterCRDT("H", 0, "remote-1"),
        new CharacterCRDT("i", 1, "remote-1"),
        new CharacterCRDT("!", 2, "remote-1"),
      ];

      setCharacters((prev) => {
        const merged = [...prev, ...remoteChanges].sort((a, b) =>
          a.compareTo(b)
        );
        return merged;
      });
    };

    // Simulate remote changes after 2 seconds
    const timeout = setTimeout(simulateRemoteChanges, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Update text whenever characters change
  useEffect(() => {
    const newText = characters.map((char) => char.value).join("");
    setText(newText);
  }, [characters]);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const newValue = e.target.value;
    const diff = newValue.length - text.length;

    if (diff > 0) {
      // Insert
      const char = newValue[newValue.length - 1];
      const newChar = new CharacterCRDT(char, characters.length, siteId);
      setCharacters((prev) =>
        [...prev, newChar].sort((a, b) => a.compareTo(b))
      );
    } else if (diff < 0) {
      // Delete
      setCharacters((prev) => prev.slice(0, -1));
    }
  };

  return (
    <Card className="m-5 md:m-10">
      <CardHeader>
        <CardTitle>Collaborative Text Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-500">Your Site ID: {siteId}</div>
          <textarea
            value={text}
            onChange={handleInput}
            className="w-full h-32 p-2 border rounded-md"
            placeholder="Start typing..."
          />
          <div className="text-sm text-gray-500">
            CRDT Structure:
            <pre className="mt-2 p-2 bg-gray-100 rounded-md overflow-x-auto">
              {JSON.stringify(characters, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default App;
