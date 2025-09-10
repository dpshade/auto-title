/**
 * Utility for extracting titles from LLM responses with multiple fallback methods
 */
export class TitleExtractor {
    
    /**
     * Extract title from LLM response using multiple parsing strategies
     */
    static extractTitle(response: string): string | null {
        if (!response || response.trim().length === 0) {
            return null;
        }

        const cleanResponse = response.trim();

        // Strategy 1: Try JSON parsing first
        const jsonTitle = this.extractFromJSON(cleanResponse);
        if (jsonTitle) {
            return jsonTitle;
        }

        // Strategy 2: Extract from code blocks (```json or ```)
        const codeBlockTitle = this.extractFromCodeBlock(cleanResponse);
        if (codeBlockTitle) {
            return codeBlockTitle;
        }

        // Strategy 3: Look for JSON-like patterns without proper formatting
        const jsonPatternTitle = this.extractFromJSONPattern(cleanResponse);
        if (jsonPatternTitle) {
            return jsonPatternTitle;
        }

        // Strategy 4: Extract from quotes
        const quotedTitle = this.extractFromQuotes(cleanResponse);
        if (quotedTitle) {
            return quotedTitle;
        }

        // Strategy 5: Fallback to first line if it looks like a title
        const firstLineTitle = this.extractFromFirstLine(cleanResponse);
        if (firstLineTitle) {
            return firstLineTitle;
        }

        return null;
    }

    /**
     * Try to parse as proper JSON
     */
    private static extractFromJSON(response: string): string | null {
        try {
            const parsed = JSON.parse(response);
            return parsed.title || null;
        } catch {
            return null;
        }
    }

    /**
     * Extract JSON from code blocks (```json or ```)
     */
    private static extractFromCodeBlock(response: string): string | null {
        // Match ```json content ``` or ``` content ```
        const codeBlockRegex = /```(?:json)?\s*\n?(.*?)\n?```/s;
        const match = response.match(codeBlockRegex);
        
        if (match && match[1]) {
            try {
                const parsed = JSON.parse(match[1].trim());
                return parsed.title || null;
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Look for JSON-like patterns even if not properly formatted
     */
    private static extractFromJSONPattern(response: string): string | null {
        // Look for {"title": "something"} pattern
        const jsonPatternRegex = /\{\s*["']?title["']?\s*:\s*["']([^"']+)["']\s*\}/i;
        const match = response.match(jsonPatternRegex);
        
        if (match && match[1]) {
            return match[1].trim();
        }
        return null;
    }

    /**
     * Extract title from quoted text
     */
    private static extractFromQuotes(response: string): string | null {
        // Look for quoted strings that could be titles
        const quotedRegex = /["']([^"']{2,50})["']/;
        const match = response.match(quotedRegex);
        
        if (match && match[1]) {
            const title = match[1].trim();
            // Only return if it looks like a reasonable title (2-5 words, not too long)
            const wordCount = title.split(/\s+/).length;
            if (wordCount >= 2 && wordCount <= 5 && title.length <= 50) {
                return title;
            }
        }
        return null;
    }

    /**
     * Use first line if it looks like a title
     */
    private static extractFromFirstLine(response: string): string | null {
        const firstLine = response.split('\n')[0].trim();
        
        // Remove common prefixes
        const cleanLine = firstLine
            .replace(/^(title:\s*|answer:\s*|result:\s*)/i, '')
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .trim();

        // Check if it looks like a reasonable title
        const wordCount = cleanLine.split(/\s+/).length;
        if (wordCount >= 2 && wordCount <= 8 && cleanLine.length <= 100 && cleanLine.length >= 5) {
            return cleanLine;
        }
        return null;
    }

    /**
     * Validate and clean extracted title
     */
    static validateAndCleanTitle(title: string): string | null {
        if (!title) return null;

        // Clean up the title
        const cleaned = title
            .replace(/["`]/g, '') // Remove quotes
            .replace(/[\\/:*?"<>|]/g, '-') // Replace invalid filename chars
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        // Validate length and word count
        const wordCount = cleaned.split(/\s+/).length;
        if (cleaned.length < 2 || cleaned.length > 100 || wordCount < 1 || wordCount > 10) {
            return null;
        }

        return cleaned;
    }
}