/*
 * Worker for processing JSON streams off the main thread.
 * Handles reading, size limit enforcement, decoding, and parsing.
 * Returns data in chunks to prevent UI blocking during transfer.
 */
self.onmessage = async (e) => {
    const { type, stream, limit } = e.data;

    if (type === 'processStream') {
        try {
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            const chunks = [];
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                receivedLength += value.length;

                if (limit && receivedLength > limit) {
                    reader.cancel();
                    throw new Error(`File size exceeds ${Math.floor(limit / 1024 / 1024)}MB limit.`);
                }

                chunks.push(decoder.decode(value, { stream: true }));
            }
            // Flush decoder
            chunks.push(decoder.decode());

            // OPTIMIZATION: Use array join for performance (verified faster than concatenation)
            const jsonString = chunks.join('');

            // This parse happens in the worker, so it doesn't block the UI
            const data = JSON.parse(jsonString);

            // Send metadata (excluding questions array)
            const { questions, ...meta } = data;
            self.postMessage({ type: 'meta', data: meta });

            // Send questions in chunks to allow UI updates between batches
            if (questions && Array.isArray(questions)) {
                const chunkSize = 500;
                for (let i = 0; i < questions.length; i += chunkSize) {
                    const chunk = questions.slice(i, i + chunkSize);
                    self.postMessage({ type: 'chunk', data: chunk });
                }
            }

            self.postMessage({ type: 'done' });

        } catch (error) {
            self.postMessage({ type: 'error', message: error.message });
        }
    }
};
