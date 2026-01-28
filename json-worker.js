/*
 * Worker for processing JSON streams off the main thread.
 * Handles reading, size limit enforcement, decoding, and parsing.
 * Returns data in chunks to prevent UI blocking during transfer.
 */
self.onmessage = async (e) => {
    const { type, stream, limit } = e.data;

    if (type === 'processStream') {
        try {
            let receivedLength = 0;
            let sizeLimitExceeded = false;

            const countingStream = new TransformStream({
                transform(chunk, controller) {
                    receivedLength += chunk.byteLength;
                    if (limit && receivedLength > limit) {
                        sizeLimitExceeded = true;
                        controller.error(new Error(`File size exceeds limit`));
                    } else {
                        controller.enqueue(chunk);
                    }
                }
            });

            let data;
            try {
                // OPTIMIZATION: Parse directly from stream to avoid large string allocation
                data = await new Response(stream.pipeThrough(countingStream)).json();
            } catch (error) {
                if (sizeLimitExceeded) {
                    throw new Error(`File size exceeds ${Math.floor(limit / 1024 / 1024)}MB limit.`);
                }
                throw error;
            }

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
