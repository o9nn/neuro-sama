/**
 * Semantic Memory with Vector Database Support
 * 
 * Implements semantic memory storage and retrieval using vector embeddings
 * for more sophisticated similarity search beyond keyword matching.
 * 
 * This is a lightweight implementation that can be backed by:
 * - In-memory vector store (default)
 * - External vector DB (Pinecone, Weaviate, Qdrant, etc.) via adapter
 * 
 * Key features:
 * - Embedding-based similarity search
 * - Semantic clustering
 * - Hybrid search (vector + keyword)
 * - Memory consolidation
 */

import { Episode } from './types';

/**
 * Vector embedding representation
 */
export interface VectorEmbedding {
  /** Episode ID */
  id: string;
  
  /** Embedding vector */
  vector: number[];
  
  /** Metadata for filtering */
  metadata: {
    timestamp: number;
    importance: number;
    game_context: string;
    emotional_valence: number;
  };
}

/**
 * Semantic search result
 */
export interface SemanticSearchResult {
  /** Matching episode */
  episode: Episode;
  
  /** Similarity score (0-1) */
  similarity: number;
  
  /** Rank in results */
  rank: number;
}

/**
 * Semantic cluster of related memories
 */
export interface SemanticCluster {
  /** Cluster ID */
  id: string;
  
  /** Centroid embedding */
  centroid: number[];
  
  /** Episodes in cluster */
  episodes: Episode[];
  
  /** Cluster theme/label */
  theme: string;
  
  /** Cluster coherence (0-1) */
  coherence: number;
}

/**
 * Embedding function interface
 * Can be implemented with different embedding models
 */
export interface EmbeddingFunction {
  /** Generate embedding for text */
  embed: (text: string) => Promise<number[]> | number[];
  
  /** Embedding dimension */
  dimension: number;
}

/**
 * Simple TF-IDF based embedding (fallback when no model available)
 */
export class SimpleTFIDFEmbedding implements EmbeddingFunction {
  dimension = 128;
  private vocabulary: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();
  private documentCount = 0;
  
  /**
   * Generate embedding using TF-IDF
   */
  embed(text: string): number[] {
    const words = this.tokenize(text);
    const vector = new Array(this.dimension).fill(0);
    
    // TF-IDF vector
    const tf = this.computeTF(words);
    
    for (const [word, tfValue] of Object.entries(tf)) {
      const idfValue = this.idf.get(word) || 0;
      const tfidf = tfValue * idfValue;
      
      // Hash word to dimension
      const index = this.hashToDimension(word);
      vector[index] += tfidf;
    }
    
    // Normalize
    return this.normalize(vector);
  }
  
  /**
   * Update IDF with document
   */
  updateIDF(documents: string[]): void {
    this.documentCount = documents.length;
    const documentFrequency = new Map<string, number>();
    
    for (const doc of documents) {
      const words = new Set(this.tokenize(doc));
      for (const word of words) {
        documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1);
      }
    }
    
    // Calculate IDF
    for (const [word, df] of documentFrequency) {
      this.idf.set(word, Math.log(this.documentCount / df));
    }
  }
  
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }
  
  private computeTF(words: string[]): Record<string, number> {
    const tf: Record<string, number> = {};
    for (const word of words) {
      tf[word] = (tf[word] || 0) + 1;
    }
    // Normalize
    for (const word in tf) {
      tf[word] /= words.length;
    }
    return tf;
  }
  
  private hashToDimension(word: string): number {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % this.dimension;
  }
  
  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }
}

/**
 * Configuration for semantic memory
 */
export interface SemanticMemoryConfig {
  /** Embedding function */
  embeddingFunction: EmbeddingFunction;
  
  /** Maximum vectors to store */
  maxVectors: number;
  
  /** Similarity threshold for retrieval */
  similarityThreshold: number;
  
  /** Number of clusters for semantic organization */
  numClusters: number;
  
  /** Re-clustering frequency (number of additions) */
  reclusterFrequency: number;
}

/**
 * Default configuration
 */
export const DEFAULT_SEMANTIC_CONFIG: Partial<SemanticMemoryConfig> = {
  maxVectors: 1000,
  similarityThreshold: 0.5,
  numClusters: 10,
  reclusterFrequency: 50
};

/**
 * Semantic Memory System
 * 
 * Vector-based semantic memory for sophisticated similarity search.
 */
export class SemanticMemorySystem {
  private embeddings: VectorEmbedding[];
  private episodeMap: Map<string, Episode>;
  private clusters: SemanticCluster[];
  private config: SemanticMemoryConfig;
  private additionsSinceCluster: number = 0;
  
  constructor(config?: Partial<SemanticMemoryConfig>) {
    this.config = {
      embeddingFunction: new SimpleTFIDFEmbedding(),
      maxVectors: 1000,
      similarityThreshold: 0.5,
      numClusters: 10,
      reclusterFrequency: 50,
      ...config
    };
    
    this.embeddings = [];
    this.episodeMap = new Map();
    this.clusters = [];
  }
  
  /**
   * Add episode to semantic memory
   */
  async addEpisode(episode: Episode): Promise<void> {
    // Generate embedding
    const text = this.episodeToText(episode);
    const vector = await this.config.embeddingFunction.embed(text);
    
    // Create embedding entry
    const embedding: VectorEmbedding = {
      id: episode.id,
      vector,
      metadata: {
        timestamp: episode.timestamp,
        importance: episode.importance,
        game_context: episode.game_context,
        emotional_valence: episode.emotional_context.valence
      }
    };
    
    this.embeddings.push(embedding);
    this.episodeMap.set(episode.id, episode);
    
    // Prune if needed
    if (this.embeddings.length > this.config.maxVectors) {
      this.pruneVectors();
    }
    
    // Re-cluster periodically
    this.additionsSinceCluster++;
    if (this.additionsSinceCluster >= this.config.reclusterFrequency) {
      await this.recluster();
      this.additionsSinceCluster = 0;
    }
  }
  
  /**
   * Semantic search - find similar episodes
   */
  async semanticSearch(
    query: string,
    limit: number = 5,
    filters?: {
      minImportance?: number;
      gameContext?: string;
      timeRange?: { start: number; end: number };
    }
  ): Promise<SemanticSearchResult[]> {
    // Generate query embedding
    const queryVector = await this.config.embeddingFunction.embed(query);
    
    // Compute similarities
    const results: Array<{ episode: Episode; similarity: number }> = [];
    
    for (const embedding of this.embeddings) {
      // Apply filters
      if (filters) {
        if (filters.minImportance && embedding.metadata.importance < filters.minImportance) {
          continue;
        }
        if (filters.gameContext && embedding.metadata.game_context !== filters.gameContext) {
          continue;
        }
        if (filters.timeRange) {
          const { start, end } = filters.timeRange;
          if (embedding.metadata.timestamp < start || embedding.metadata.timestamp > end) {
            continue;
          }
        }
      }
      
      // Compute cosine similarity
      const similarity = this.cosineSimilarity(queryVector, embedding.vector);
      
      if (similarity >= this.config.similarityThreshold) {
        const episode = this.episodeMap.get(embedding.id);
        if (episode) {
          results.push({ episode, similarity });
        }
      }
    }
    
    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);
    
    // Return top k with rank
    return results.slice(0, limit).map((r, index) => ({
      episode: r.episode,
      similarity: r.similarity,
      rank: index + 1
    }));
  }
  
  /**
   * Hybrid search - combines semantic and keyword matching
   */
  async hybridSearch(
    query: string,
    limit: number = 5,
    semanticWeight: number = 0.7
  ): Promise<SemanticSearchResult[]> {
    // Semantic search
    const semanticResults = await this.semanticSearch(query, limit * 2);
    
    // Keyword search
    const keywordResults = this.keywordSearch(query, limit * 2);
    
    // Merge and re-rank
    const merged = new Map<string, { episode: Episode; score: number }>();
    
    for (const result of semanticResults) {
      merged.set(result.episode.id, {
        episode: result.episode,
        score: result.similarity * semanticWeight
      });
    }
    
    const keywordWeight = 1 - semanticWeight;
    for (const result of keywordResults) {
      const existing = merged.get(result.episode.id);
      if (existing) {
        existing.score += result.similarity * keywordWeight;
      } else {
        merged.set(result.episode.id, {
          episode: result.episode,
          score: result.similarity * keywordWeight
        });
      }
    }
    
    // Sort by combined score
    const results = Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return results.map((r, index) => ({
      episode: r.episode,
      similarity: r.score,
      rank: index + 1
    }));
  }
  
  /**
   * Get semantic clusters
   */
  getClusters(): SemanticCluster[] {
    return [...this.clusters];
  }
  
  /**
   * Find cluster for episode
   */
  findCluster(episodeId: string): SemanticCluster | null {
    return this.clusters.find(c => 
      c.episodes.some(e => e.id === episodeId)
    ) || null;
  }
  
  /**
   * Get cluster summary
   */
  getClusterSummary(): string[] {
    return this.clusters.map(c => 
      `${c.theme} (${c.episodes.length} memories, coherence: ${c.coherence.toFixed(2)})`
    );
  }
  
  /**
   * Clear all vectors
   */
  clear(): void {
    this.embeddings = [];
    this.episodeMap.clear();
    this.clusters = [];
    this.additionsSinceCluster = 0;
  }
  
  // ===== Private Helper Methods =====
  
  /**
   * Convert episode to text for embedding
   */
  private episodeToText(episode: Episode): string {
    return `${episode.event} ${episode.game_context} ${episode.outcome || ''}`.trim();
  }
  
  /**
   * Compute cosine similarity between vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vector dimensions must match');
    }
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  /**
   * Simple keyword search for hybrid approach
   */
  private keywordSearch(query: string, limit: number): SemanticSearchResult[] {
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const results: Array<{ episode: Episode; similarity: number }> = [];
    
    for (const [id, episode] of this.episodeMap) {
      const text = this.episodeToText(episode).toLowerCase();
      let matches = 0;
      
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          matches++;
        }
      }
      
      if (matches > 0) {
        results.push({
          episode,
          similarity: matches / keywords.length
        });
      }
    }
    
    results.sort((a, b) => b.similarity - a.similarity);
    
    return results.slice(0, limit).map((r, index) => ({
      episode: r.episode,
      similarity: r.similarity,
      rank: index + 1
    }));
  }
  
  /**
   * Prune least important vectors
   */
  private pruneVectors(): void {
    // Sort by importance
    this.embeddings.sort((a, b) => a.metadata.importance - b.metadata.importance);
    
    // Remove least important
    const toRemove = this.embeddings.length - this.config.maxVectors;
    const removed = this.embeddings.splice(0, toRemove);
    
    // Clean up episode map
    for (const embedding of removed) {
      this.episodeMap.delete(embedding.id);
    }
  }
  
  /**
   * Re-cluster memories using k-means
   */
  private async recluster(): Promise<void> {
    if (this.embeddings.length < this.config.numClusters) {
      return;
    }
    
    // Simple k-means clustering
    const k = this.config.numClusters;
    
    // Initialize centroids randomly
    let centroids: number[][] = [];
    const usedIndices = new Set<number>();
    
    for (let i = 0; i < k; i++) {
      let index: number;
      do {
        index = Math.floor(Math.random() * this.embeddings.length);
      } while (usedIndices.has(index));
      
      usedIndices.add(index);
      centroids.push([...this.embeddings[index].vector]);
    }
    
    // K-means iterations
    const maxIterations = 10;
    let assignments: number[] = new Array(this.embeddings.length).fill(0);
    
    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign to nearest centroid
      for (let i = 0; i < this.embeddings.length; i++) {
        let minDist = Infinity;
        let bestCluster = 0;
        
        for (let c = 0; c < k; c++) {
          const dist = 1 - this.cosineSimilarity(
            this.embeddings[i].vector,
            centroids[c]
          );
          
          if (dist < minDist) {
            minDist = dist;
            bestCluster = c;
          }
        }
        
        assignments[i] = bestCluster;
      }
      
      // Update centroids
      const newCentroids: number[][] = [];
      
      for (let c = 0; c < k; c++) {
        const clusterVectors = this.embeddings
          .filter((_, i) => assignments[i] === c)
          .map(e => e.vector);
        
        if (clusterVectors.length === 0) {
          newCentroids.push(centroids[c]);
          continue;
        }
        
        const newCentroid = new Array(this.config.embeddingFunction.dimension).fill(0);
        
        for (const vector of clusterVectors) {
          for (let d = 0; d < vector.length; d++) {
            newCentroid[d] += vector[d];
          }
        }
        
        for (let d = 0; d < newCentroid.length; d++) {
          newCentroid[d] /= clusterVectors.length;
        }
        
        newCentroids.push(newCentroid);
      }
      
      centroids = newCentroids;
    }
    
    // Create clusters
    this.clusters = [];
    
    for (let c = 0; c < k; c++) {
      const clusterEpisodes = this.embeddings
        .filter((_, i) => assignments[i] === c)
        .map(e => this.episodeMap.get(e.id))
        .filter((e): e is Episode => e !== undefined);
      
      if (clusterEpisodes.length === 0) {
        continue;
      }
      
      // Compute coherence (average similarity to centroid)
      const coherence = this.embeddings
        .filter((_, i) => assignments[i] === c)
        .reduce((sum, e) => sum + this.cosineSimilarity(e.vector, centroids[c]), 0) /
        clusterEpisodes.length;
      
      // Generate theme from most common words
      const theme = this.generateClusterTheme(clusterEpisodes);
      
      this.clusters.push({
        id: `cluster_${c}`,
        centroid: centroids[c],
        episodes: clusterEpisodes,
        theme,
        coherence
      });
    }
  }
  
  /**
   * Generate theme label for cluster
   */
  private generateClusterTheme(episodes: Episode[]): string {
    const wordCounts = new Map<string, number>();
    
    for (const episode of episodes) {
      const words = this.episodeToText(episode)
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3);
      
      for (const word of words) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
    
    // Get top 3 words
    const topWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
    
    return topWords.join(' + ');
  }
}

/**
 * Create semantic memory system
 */
export function createSemanticMemorySystem(
  config?: Partial<SemanticMemoryConfig>
): SemanticMemorySystem {
  return new SemanticMemorySystem(config);
}
