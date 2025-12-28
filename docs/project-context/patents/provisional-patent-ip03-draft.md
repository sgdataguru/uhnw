# Provisional Patent Application Draft: IP-03

## Network-Based Relationship Scoring System for Wealth Management

**Applicant**: [Company Name]  
**Inventors**: [Inventor Names]  
**Filing Date**: [To be determined]  
**Application Type**: Provisional Patent Application (India)

---

## TITLE OF THE INVENTION

**System and Method for Calculating Engagement Probability Using Graph-Based Relationship Strength Analysis in Wealth Management**

---

## FIELD OF THE INVENTION

This invention relates to computer-implemented systems and methods for calculating the probability of successful client engagement based on professional, social, and institutional network connections, specifically to graph database systems that analyze multi-layer relationship networks to identify optimal introduction paths for wealth management relationship managers.

---

## BACKGROUND OF THE INVENTION

### Technical Problem

Wealth management firms serving Ultra-High-Net-Worth (UHNW) individuals face a critical challenge: cold outreach to prospects has extremely low success rates (<5%), while warm introductions through trusted intermediaries have 10-20x higher conversion rates. However, Relationship Managers (RMs) lack systematic, computer-implemented methods to:

1. Identify hidden connection paths to prospects through professional, social, and institutional networks
2. Quantify relationship strength across multiple connection types (employment, investment, board membership, alumni, family)
3. Prioritize among multiple potential introduction paths based on engagement probability
4. Leverage institutional relationships (private equity funds, family offices, country clubs, charitable foundations)

### Limitations of Prior Art

Existing social network analysis systems (e.g., LinkedIn "People You May Know") suffer from the following technical deficiencies:

1. **Single-Layer Networks**: Prior art systems model only professional connections, ignoring social, family, and institutional relationships critical to UHNW ecosystems.

2. **Unweighted Connections**: Existing systems treat all connections equally (binary: connected or not connected), failing to quantify relationship strength based on recency, interaction frequency, and mutual connections.

3. **No Engagement Probability Calculation**: Prior art shows connection paths but does not predict the probability of successful engagement through each path.

4. **Generic Application**: Existing systems are designed for mass-market social networking, not for UHNW wealth management where institutional relationships (PE fund co-investors, family office connections, board memberships) are critical.

5. **No Intermediary Willingness Modeling**: Prior art assumes all intermediaries are equally willing to make introductions, ignoring personality factors and reciprocity.

6. **Lack of Context-Aware Recommendations**: Existing systems show "people you may know" but do not provide actionable introduction strategies (what to say, when to ask, how to approach).

### Technical Need

There exists a technical need for a computer-implemented system that:

- Models UHNW ecosystems as multi-layer graphs (professional, social, family, institutional)
- Calculates relationship strength using recency, frequency, and mutual connection factors
- Discovers influence paths using weighted graph traversal algorithms
- Predicts engagement probability for each path using multi-dimensional scoring
- Provides context-aware introduction recommendations with timing and approach strategies

---

## SUMMARY OF THE INVENTION

The present invention addresses the aforementioned technical problems by providing a graph-based relationship scoring system that calculates engagement probability using multi-layer network analysis.

### Core Technical Innovation

The invention employs a **graph database architecture** with the following novel components:

1. **Multi-Layer Relationship Graph**: Nodes (persons, companies, institutions) and edges (relationships) with multiple relationship types and attributes
2. **Relationship Strength Calculation**: Combines base weight, recency decay, frequency boost, and mutual connections boost
3. **Weighted Path Discovery**: Modified Dijkstra's algorithm with path strength scoring
4. **Engagement Probability Model**: Multi-dimensional scoring combining path strength, context relevance, and timing
5. **Intermediary Willingness Scoring**: Accounts for connector personality and reciprocity
6. **Context-Aware Recommendations**: Generates specific introduction strategies with talking points

### Technical Advantages

1. **Multi-Layer Network Model**: Captures professional, social, family, and institutional relationships
2. **Quantitative Relationship Strength**: Numerical scoring (0-1) based on multiple factors
3. **UHNW-Specific Relationship Types**: PE fund co-investors, family office connections, board memberships
4. **Engagement Probability Prediction**: Not just connection existence, but success likelihood
5. **Actionable Recommendations**: Specific introduction strategies, not generic suggestions

---

## DETAILED DESCRIPTION OF THE INVENTION

### System Architecture

#### 1. Graph Database Module (Neo4j)

**Function**: Store and query multi-layer relationship graph

**Schema**:

**Nodes**:

- `PERSON`: Individuals (name, title, company, location, net worth)
- `COMPANY`: Corporations (name, industry, size, market cap)
- `INSTITUTION`: Organizations (type: pe_fund, family_office, club, foundation, school)

**Edges (Relationships)**:

- `EMPLOYED_BY`: Person → Company (since, title)
- `INVESTED_IN`: Person → Company/Fund (amount, date)
- `BOARD_MEMBER_OF`: Person → Company/Institution (since, role)
- `ALUMNI_OF`: Person → Institution (graduation_year, degree)
- `MEMBER_OF`: Person → Club/Association (since, membership_type)
- `FAMILY_RELATION`: Person ↔ Person (relation_type: spouse, sibling, parent)
- `BUSINESS_PARTNER`: Person ↔ Person (since, partnership_type)
- `ADVISOR_TO`: Person → Person/Company (since, advisory_type)
- `KNOWS`: Person ↔ Person (generic connection, strength, context)

**Edge Attributes**:

- `strength`: Numerical score (0.0-1.0) indicating relationship intensity
- `context`: Categorical (professional, social, family, institutional)
- `since`: Date when relationship began
- `last_interaction`: Most recent contact date
- `source`: Data source (LinkedIn, CRM, news, manual entry)

**Example Graph Structure**:

```cypher
(RM:PERSON {name:"Priya Sharma", role:"Relationship Manager"})
  -[:EMPLOYED_BY {since:"2020-01-01"}]-> (WealthBank:COMPANY)
  -[:ALUMNI_OF {year:2015}]-> (IIM_A:INSTITUTION {type:"business_school"})

(Prospect:PERSON {name:"Amit Verma", net_worth:500})
  -[:FOUNDER_OF]-> (CloudTech:COMPANY)
  -[:ALUMNI_OF {year:2015}]-> (IIM_A:INSTITUTION)
  -[:INVESTED_IN]-> (TechFund:INSTITUTION {type:"pe_fund"})

(Connector:PERSON {name:"Rajesh Kumar"})
  -[:ALUMNI_OF {year:2015}]-> (IIM_A:INSTITUTION)
  -[:INVESTED_IN]-> (TechFund:INSTITUTION)
  -[:KNOWS {strength:0.8, last_interaction:"2025-12-01"}]-> (Prospect)
```

---

#### 2. Relationship Strength Calculation Module

**Function**: Assign strength score (0-1) to each edge

**Algorithm**:

```
S(e) = W(type) × R(t) + F(n) + M(k)
```

Where:

- **S(e)** = Strength of edge e (0-1, capped)
- **W(type)** = Base weight for connection type
- **R(t)** = Recency factor = e^(-λ × years_since_last_interaction)
- **F(n)** = Frequency boost = min(0.3, log₁₀(interactions_per_year) × 0.1)
- **M(k)** = Mutual connections boost = min(0.2, k / 20)

**Base Weight Table**:

| Connection Type | Base Weight (W) | Rationale |
|----------------|-----------------|-----------|
| Family (spouse, parent, child) | 1.0 | Strongest personal bond |
| Business Partner | 0.95 | High trust, shared interests |
| Close Friend | 0.90 | Strong personal relationship |
| Board Co-Member | 0.75 | Professional collaboration |
| Colleague (current) | 0.70 | Active working relationship |
| PE Fund Co-Investor | 0.65 | Shared financial interests |
| Family Office Connection | 0.60 | Wealth management ecosystem |
| Alumni (same year) | 0.60 | Shared experience, cohort bond |
| Colleague (former) | 0.50 | Past working relationship |
| Alumni (different year) | 0.40 | Institutional connection |
| Club Member | 0.45 | Social connection |
| Generic "Knows" | 0.30 | Weak connection |

**Recency Decay**:

```
R(t) = e^(-λ × t)
```

Where:

- λ = 0.2 (decay constant)
- t = years since last interaction
- Half-life = ln(2)/λ ≈ 3.5 years

**Example Calculation**:

Connection: Former colleagues (base weight 0.50)

- Last interaction: 2 years ago → R = e^(-0.2×2) = 0.67
- Interactions: 4/year → F = log₁₀(4) × 0.1 = 0.06
- Mutual connections: 8 → M = 8/20 = 0.08

```
S = 0.50 × 0.67 + 0.06 + 0.08 = 0.335 + 0.14 = 0.475
```

---

#### 3. Influence Path Discovery Engine

**Function**: Find top-K paths from RM to Prospect

**Algorithm**: Modified Dijkstra's shortest path (maximize strength product)

**Pseudocode**:

```python
def find_influence_paths(rm_id, prospect_id, max_hops=3, top_k=5):
    paths = []
    visited = set()
    
    # Priority queue (max-heap by path strength)
    queue = PriorityQueue()
    queue.put((1.0, [rm_id], []))  # (strength, node_path, edge_path)
    
    while not queue.empty() and len(paths) < top_k:
        strength, node_path, edge_path = queue.get()
        current = node_path[-1]
        
        if current == prospect_id:
            paths.append({
                'nodes': node_path,
                'edges': edge_path,
                'strength': strength
            })
            continue
        
        if len(node_path) > max_hops or current in visited:
            continue
        
        visited.add(current)
        
        # Explore neighbors
        for neighbor, edge in get_neighbors(current):
            if neighbor not in node_path:  # Avoid cycles
                new_strength = strength * edge.strength
                new_node_path = node_path + [neighbor]
                new_edge_path = edge_path + [edge]
                queue.put((new_strength, new_node_path, new_edge_path))
    
    return paths
```

**Path Strength Scoring**:

```
PathStrength(P) = [∏ S(eᵢ)] × D(L)
                  i=1 to L
```

Where:

- **L** = Path length (number of hops)
- **S(eᵢ)** = Strength of edge i
- **D(L)** = Distance penalty = 1.0 / L^0.5

**Rationale**: Product of edge strengths (weak link degrades path). Distance penalty favors shorter paths.

**Example**:

Path: RM → Connector1 → Connector2 → Prospect (3 hops)

- Edge strengths: 0.8, 0.6, 0.7
- Product: 0.8 × 0.6 × 0.7 = 0.336
- Distance penalty: 1.0 / √3 = 0.577
- **Final Path Strength**: 0.336 × 0.577 = 0.194

---

#### 4. Engagement Probability Calculation Module

**Function**: Predict success probability for each path

**Algorithm**:

```
P(engagement | path) = α × PathStrength + β × ContextRelevance + γ × TimingScore
```

Where:

- **α, β, γ** = Weights (0.5, 0.3, 0.2)
- **PathStrength** = From path discovery algorithm
- **ContextRelevance** = Alignment between connection context and engagement goal (0-1)
- **TimingScore** = Recency of intermediary interactions (0-1)

**Context Relevance Scoring**:

| Connection Context | Relevance for Wealth Management |
|-------------------|--------------------------------|
| Business (professional) | 0.9 |
| Institutional (PE fund, family office) | 0.8 |
| Family | 0.7 |
| Social (club, alumni) | 0.6 |

**Timing Score**:

```
TimingScore = 1 - (days_since_intermediary_interaction / 365)
```

Capped at 0-1.

**Example**:

- Path strength: 0.194
- Context: Business (0.9)
- Timing: Last interaction 10 days ago → 1 - (10/365) = 0.973

```
P = 0.5×0.194 + 0.3×0.9 + 0.2×0.973 = 0.097 + 0.27 + 0.195 = 0.562 (56%)
```

---

#### 5. Intermediary Willingness Scoring Module

**Function**: Estimate willingness of intermediaries to make introductions

**Algorithm**:

```
Willingness(person) = BaseWillingness × IntroductionHistory × Reciprocity
```

Where:

- **BaseWillingness** = Personality factor (0-1, from ML model or manual input)
- **IntroductionHistory** = Past introduction success rate (successful_intros / total_intros)
- **Reciprocity** = 1.2 if person has requested introductions from RM, 1.0 otherwise

**Example**:

- Connector has made 10 introductions, 7 successful → History = 0.70
- Connector previously asked RM for 2 introductions → Reciprocity = 1.2
- Base willingness: 0.80 (estimated from personality profile)

```
Willingness = 0.80 × 0.70 × 1.2 = 0.672
```

---

#### 6. Recommendation Generation Module

**Function**: Generate actionable introduction strategies

**Output**:

- **Recommended Path**: Highest-ranked path by engagement probability
- **Intermediaries**: List of connectors in path
- **Approach Strategy**: Suggested talking points and timing
- **Context**: Why this path works (shared connections, recent interactions)

**Example Output**:

```
Recommended Introduction Path to Amit Verma:

Path: You → Vikram Shah → Sanjay Mehta → Amit Verma
Engagement Probability: 67%

Why this path works:
✓ Vikram is a trusted client (last contact: 10 days ago)
✓ Sanjay is Amit's close friend (recent interaction)
✓ Business context aligns with wealth management goal

Suggested Approach:
1. Call Vikram this week (he's responsive)
2. Mention: "I help entrepreneurs like Amit with post-exit wealth planning. 
   Would you be comfortable introducing me to Sanjay, who could connect me to Amit?"
3. Offer value: "Happy to provide you a complimentary portfolio review as a thank you."

Alternative Paths:
• Path 2 (via Rajesh Kumar) - 35% probability
• Path 3 (via Neha Gupta) - 28% probability
```

---

### Technical Implementation Details

#### Real-Time Graph Updates

**Data Sources**:

- LinkedIn API (professional connections)
- CRM data (client relationships, interactions)
- Corporate filings (board memberships, shareholdings)
- News/events (conference attendees, gala co-attendees)
- Manual entry by RMs

**Update Frequency**:

- LinkedIn: Daily sync
- CRM: Real-time (as RMs log interactions)
- Corporate filings: Weekly
- News/events: Real-time (as detected)

**Incremental Updates**:

- New connection detected → Add edge to graph
- Interaction logged → Update `last_interaction` attribute, recalculate strength
- Relationship ended → Mark edge as inactive (soft delete)

---

#### Performance Optimization

**Graph Query Optimization**:

- **Indexing**: Nodes indexed by person_id, company_id
- **Caching**: Frequently accessed paths cached (TTL: 24 hours)
- **Parallel Processing**: Path discovery parallelized across multiple starting nodes

**Scalability**:

- **Graph Size**: Handles 100,000+ persons, 1,000,000+ relationships
- **Query Latency**: Sub-second response for path discovery (3-hop limit)
- **Concurrent Users**: Supports 1,000+ RMs querying simultaneously

---

## CLAIMS

### Claim 1 (Independent - Method)

A computer-implemented method for calculating engagement probability between a relationship manager and a prospect individual using graph-based relationship analysis, the method comprising:

(a) constructing, by a graph database module executing on at least one processor, a multi-layer relationship graph comprising:

- a plurality of person nodes, each representing an individual;
- a plurality of entity nodes, each representing a company or institution;
- a plurality of directed or undirected edges connecting nodes, wherein each edge represents a relationship and is associated with:
  - a relationship type selected from a predefined taxonomy including employment, investment, board membership, alumni affiliation, family relation, and social connection;
  - a strength score indicating relationship intensity calculated using a formula combining a base weight, a recency factor, a frequency boost, and a mutual connections boost;
  - a timestamp indicating relationship start date and last interaction date;
  - a context attribute indicating whether the relationship is professional, social, family, or institutional;

(b) calculating, by a relationship strength module executing on the at least one processor, the strength score for each edge according to the formula:

   ```
   S(e) = W(type) × e^(-λ × t) + min(0.3, log₁₀(f) × 0.1) + min(0.2, k / 20)
   ```

   where W(type) is a base weight assigned to the relationship type, λ is a decay constant, t is years since last interaction, f is interactions per year, and k is number of mutual connections;

(c) discovering, by a path discovery module executing on the at least one processor, a plurality of influence paths from a relationship manager node to a prospect node by:

- performing a graph traversal algorithm with a maximum path length constraint of 3 hops;
- identifying all paths connecting the relationship manager node to the prospect node;
- filtering paths to exclude those containing edges with strength scores below a predefined threshold;

(d) scoring, by a path scoring module executing on the at least one processor, each discovered path by:

- computing a product of strength scores of all edges in the path;
- applying a distance penalty factor equal to 1.0 divided by the square root of path length;
- generating a path strength score based on the product and distance penalty;

(e) calculating, by an engagement probability module executing on the at least one processor, an engagement probability for each path using a weighted combination according to the formula:

   ```
   P = α × PathStrength + β × ContextRelevance + γ × TimingScore
   ```

   where α, β, γ are predefined weights summing to 1.0, PathStrength is from step (d), ContextRelevance is a similarity score between relationship context and engagement goal, and TimingScore is inversely proportional to days since last interaction with intermediaries;

(f) ranking, by a ranking module executing on the at least one processor, the plurality of paths by engagement probability in descending order;

(g) generating, by a recommendation module executing on the at least one processor, an introduction recommendation comprising:

- identification of a highest-ranked path;
- identification of intermediary nodes in the path;
- suggested approach text describing how to request introductions from intermediaries;
- timing recommendation indicating when to initiate contact; and

(h) outputting, by a user interface module executing on the at least one processor, the introduction recommendation to a display device associated with the relationship manager.

---

### Claim 2 (Dependent on Claim 1)

The method of claim 1, wherein the base weight W(type) in step (b) is selected from:

- 1.0 for family relationships;
- 0.95 for business partner relationships;
- 0.75 for board co-member relationships;
- 0.70 for current colleague relationships; and
- 0.30 for generic "knows" relationships.

---

### Claim 3 (Dependent on Claim 1)

The method of claim 1, wherein the decay constant λ in step (b) is 0.2, resulting in a relationship strength half-life of approximately 3.5 years.

---

### Claim 4 (Dependent on Claim 1)

The method of claim 1, wherein the predefined weights in step (e) are α=0.5, β=0.3, and γ=0.2.

---

### Claim 5 (Dependent on Claim 1)

The method of claim 1, further comprising:
(i) calculating, by an intermediary willingness module executing on the at least one processor, a willingness score for each intermediary node in the highest-ranked path according to the formula:

   ```
   Willingness = BaseWillingness × IntroductionHistory × Reciprocity
   ```

   where BaseWillingness is a personality factor, IntroductionHistory is a past introduction success rate, and Reciprocity is 1.2 if the intermediary has previously requested introductions from the relationship manager and 1.0 otherwise; and

(j) adjusting the engagement probability based on the willingness scores of intermediaries in the path.

---

### Claim 6 (Independent - System)

A system for calculating engagement probability using graph-based relationship analysis, the system comprising:

(a) at least one processor;

(b) at least one non-transitory computer-readable storage medium storing instructions that, when executed by the at least one processor, cause the system to:

   (i) construct a multi-layer relationship graph with person nodes, entity nodes, and relationship edges having strength scores;

   (ii) calculate strength scores for edges using base weights, recency factors, frequency boosts, and mutual connection boosts;

   (iii) discover influence paths between relationship manager and prospect nodes using graph traversal;

   (iv) score paths using edge strength products and distance penalties;

   (v) calculate engagement probabilities using weighted combinations of path strength, context relevance, and timing scores;

   (vi) rank paths by engagement probability;

   (vii) generate introduction recommendations with suggested approaches and timing; and

   (viii) output recommendations to relationship manager user interfaces.

---

### Claim 7 (Dependent on Claim 6)

The system of claim 6, wherein the multi-layer relationship graph includes at least four relationship types: professional connections, social connections, family connections, and institutional connections.

---

## ABSTRACT

A computer-implemented system and method for calculating engagement probability using graph-based relationship analysis in wealth management. The system constructs a multi-layer relationship graph with person, company, and institution nodes connected by edges representing professional, social, family, and institutional relationships. Each edge has a strength score calculated using base weight, recency decay, frequency boost, and mutual connections boost. The system discovers influence paths from relationship managers to prospects using weighted graph traversal, scores paths using edge strength products and distance penalties, and calculates engagement probabilities using multi-dimensional scoring (path strength, context relevance, timing). The invention generates actionable introduction recommendations with specific approach strategies and timing, addressing technical limitations of prior art single-layer, unweighted social network systems by providing UHNW-specific relationship modeling and engagement probability prediction.

---

## DRAWINGS (To be prepared)

**Figure 1**: Multi-layer relationship graph schema (nodes and edges)  
**Figure 2**: Relationship strength calculation flowchart  
**Figure 3**: Influence path discovery algorithm flowchart  
**Figure 4**: Engagement probability calculation formula visualization  
**Figure 5**: Example RM dashboard with path recommendations  
**Figure 6**: Graph database query performance benchmarks  

---

## INVENTOR DECLARATION

The undersigned inventor(s) declare that:

- They are the original and first inventor(s) of the subject matter claimed
- The invention has not been publicly disclosed prior to this application
- All information provided is true and accurate to the best of their knowledge

**Inventor Signature(s)**: ___________________________  
**Date**: ___________________________

---

*End of Provisional Patent Application Draft*

**Note to Patent Counsel**: This draft is prepared for provisional filing. Given the moderate Section 3(k) risk (business method concerns), consider:

1. **US-first filing strategy**: File in US (stronger software patentability), then assess India filing
2. **Trade secret alternative**: Protect specific relationship strength formulas and weights as trade secrets
3. **Emphasize technical components**: Graph database architecture, algorithms, real-time processing

Please review and refine claims, add drawings, and assess filing strategy before proceeding.
