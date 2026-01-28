/*
 * Worker for processing JSON streams off the main thread.
 * Handles reading, size limit enforcement, decoding, and robust streaming parsing.
 * Preserves metadata and reduces memory usage.
 */
self.onmessage = async (e) => {
    const { type, stream, limit } = e.data;

    if (type === 'processStream') {
        try {
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            // Parser State
            let depth = 0;
            let inString = false;
            let escape = false;
            let buffer = '';

            let currentKey = null;
            let mode = 'ROOT'; // ROOT, KEY, VALUE, ARRAY

            let questionsBatch = [];
            const BATCH_SIZE = 50;
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                receivedLength += value.length;

                if (limit && receivedLength > limit) {
                    reader.cancel();
                    throw new Error(`File size exceeds ${Math.floor(limit / 1024 / 1024)}MB limit.`);
                }

                const chunk = decoder.decode(value, { stream: true });

                for (let i = 0; i < chunk.length; i++) {
                    const char = chunk[i];

                    // 1. String State Handling
                    if (inString) {
                        buffer += char;
                        if (escape) {
                            escape = false;
                        } else {
                            if (char === '\\') {
                                escape = true;
                            } else if (char === '"') {
                                inString = false;
                            }
                        }
                        continue;
                    }

                    // 2. Structural State Handling
                    if (char === '"') {
                        inString = true;
                        buffer += char;
                        continue;
                    }

                    // Depth Tracking
                    const prevDepth = depth;
                    if (char === '{') depth++;
                    if (char === '}') depth--;
                    if (char === '[') depth++;
                    if (char === ']') depth--;

                    // 3. Parsing Logic based on Mode

                    if (mode === 'ROOT') {
                        if (char === '{') {
                            mode = 'KEY';
                            buffer = '';
                        }
                        continue;
                    }

                    if (mode === 'KEY') {
                        if (char === ':') {
                             // Key finished
                             try {
                                 // Clean buffer from potential quotes
                                 const trimmed = buffer.trim();
                                 if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                                     currentKey = JSON.parse(trimmed);
                                 } else {
                                     // Fallback or error?
                                     // Should valid JSON, so strictly parse
                                     currentKey = JSON.parse(trimmed);
                                 }
                             } catch(e) {
                                 currentKey = "unknown";
                             }
                             buffer = '';
                             mode = 'VALUE';
                        } else if ((char === ',' || char.trim() === '') && buffer.trim() === '') {
                             // Skip leading comma or whitespace
                        } else {
                             buffer += char;
                        }
                    } else if (mode === 'VALUE') {
                        // Check for array start for "questions"
                        if (currentKey === 'questions' && char === '[') {
                             mode = 'ARRAY';
                             buffer = '';
                             continue;
                        }

                        // Value ends at , or } IF depth returns to 1 (or 0)
                        if ((char === ',' && depth === 1) || (char === '}' && depth === 0)) {
                             const valStr = buffer.trim();
                             if (valStr) {
                                 try {
                                     const val = JSON.parse(valStr);
                                     self.postMessage({ type: 'meta', data: { [currentKey]: val } });
                                 } catch(e) {}
                             }
                             buffer = '';
                             currentKey = null;

                             if (depth === 0) {
                                 mode = 'DONE';
                                 self.postMessage({ type: 'done' });
                                 return;
                             } else {
                                 mode = 'KEY';
                             }
                        } else {
                             buffer += char;
                        }
                    } else if (mode === 'ARRAY') {
                        if (char === ']' && depth === 1) {
                            // End of questions array
                            mode = 'KEY';
                            currentKey = null;
                            buffer = '';
                            continue;
                        }

                        // We are capturing question objects
                        // Objects start at depth 3 (Root=1, Array=2, Object=3)
                        // And end at depth 2 (} decrements to 2)

                        if (depth >= 2) {
                            if (depth === 2 && char === ',') {
                                // Separator between objects, ignore
                            } else {
                                buffer += char;
                                if (char === '}' && depth === 2) {
                                     // End of an object
                                     try {
                                         const q = JSON.parse(buffer);
                                         questionsBatch.push(q);
                                         if (questionsBatch.length >= BATCH_SIZE) {
                                             self.postMessage({ type: 'chunk', data: questionsBatch });
                                             questionsBatch = [];
                                         }
                                     } catch(e) {}
                                     buffer = '';
                                }
                            }
                        }
                    }
                }
            }

            // Flush remaining
            if (questionsBatch.length > 0) {
                self.postMessage({ type: 'chunk', data: questionsBatch });
            }
            if (mode !== 'DONE') self.postMessage({ type: 'done' });

        } catch (error) {
            self.postMessage({ type: 'error', message: error.message });
        }
    }
};
