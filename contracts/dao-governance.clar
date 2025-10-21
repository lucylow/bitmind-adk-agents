;; DAO Governance Smart Contract
;; Implements on-chain governance for BitMind DAO

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-PROPOSAL (err u101))
(define-constant ERR-ALREADY-VOTED (err u102))
(define-constant ERR-VOTING-CLOSED (err u103))
(define-constant ERR-PROPOSAL-NOT-PASSED (err u104))
(define-constant ERR-ALREADY-EXECUTED (err u105))

;; Governance Parameters
(define-constant VOTING-PERIOD u144) ;; ~1 day at 10min blocks
(define-constant QUORUM-THRESHOLD u10000) ;; 10,000 votes
(define-constant PROPOSAL-THRESHOLD u1000) ;; 1,000 tokens to propose

;; Data Variables
(define-data-var proposal-count uint u0)

;; Data Maps
(define-map proposals
  { proposal-id: uint }
  {
    proposer: principal,
    title: (string-ascii 256),
    description: (string-ascii 2048),
    start-block-height: uint,
    end-block-height: uint,
    for-votes: uint,
    against-votes: uint,
    abstain-votes: uint,
    executed: bool,
    cancelled: bool
  }
)

(define-map proposal-actions
  { proposal-id: uint }
  {
    target-contract: principal,
    function-name: (string-ascii 64),
    function-args: (buff 1024)
  }
)

(define-map votes
  { proposal-id: uint, voter: principal }
  {
    support: uint, ;; 0 = against, 1 = for, 2 = abstain
    voting-power: uint,
    reason: (optional (string-ascii 512))
  }
)

(define-map voting-power
  { address: principal }
  { power: uint }
)

;; Read-only Functions

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals { proposal-id: proposal-id })
)

(define-read-only (get-voting-power-of (address principal))
  (default-to 
    u0 
    (get power (map-get? voting-power { address: address }))
  )
)

(define-read-only (has-voted (proposal-id uint) (voter principal))
  (is-some (map-get? votes { proposal-id: proposal-id, voter: voter }))
)

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (map-get? votes { proposal-id: proposal-id, voter: voter })
)

(define-read-only (get-proposal-state (proposal-id uint))
  (let
    (
      (proposal (unwrap! (get-proposal proposal-id) (err u0)))
      (current-block block-height)
    )
    (if (get cancelled proposal)
      (ok "CANCELLED")
      (if (get executed proposal)
        (ok "EXECUTED")
        (if (< current-block (get start-block-height proposal))
          (ok "PENDING")
          (if (< current-block (get end-block-height proposal))
            (ok "ACTIVE")
            (if (>= (get for-votes proposal) QUORUM-THRESHOLD)
              (if (> (get for-votes proposal) (get against-votes proposal))
                (ok "SUCCEEDED")
                (ok "DEFEATED")
              )
              (ok "DEFEATED")
            )
          )
        )
      )
    )
  )
)

(define-read-only (get-proposal-count)
  (ok (var-get proposal-count))
)

;; Public Functions

(define-public (propose
    (title (string-ascii 256))
    (description (string-ascii 2048))
    (target-contract principal)
    (function-name (string-ascii 64))
    (function-args (buff 1024))
  )
  (let
    (
      (proposer-power (get-voting-power-of tx-sender))
      (new-proposal-id (+ (var-get proposal-count) u1))
      (start-block (+ block-height u1))
      (end-block (+ start-block VOTING-PERIOD))
    )
    ;; Check proposer has enough voting power
    (asserts! (>= proposer-power PROPOSAL-THRESHOLD) ERR-NOT-AUTHORIZED)
    
    ;; Create proposal
    (map-set proposals
      { proposal-id: new-proposal-id }
      {
        proposer: tx-sender,
        title: title,
        description: description,
        start-block-height: start-block,
        end-block-height: end-block,
        for-votes: u0,
        against-votes: u0,
        abstain-votes: u0,
        executed: false,
        cancelled: false
      }
    )
    
    ;; Store proposal actions
    (map-set proposal-actions
      { proposal-id: new-proposal-id }
      {
        target-contract: target-contract,
        function-name: function-name,
        function-args: function-args
      }
    )
    
    ;; Increment proposal count
    (var-set proposal-count new-proposal-id)
    
    (ok new-proposal-id)
  )
)

(define-public (cast-vote (proposal-id uint) (support uint))
  (cast-vote-with-reason proposal-id support none)
)

(define-public (cast-vote-with-reason
    (proposal-id uint)
    (support uint)
    (reason (optional (string-ascii 512)))
  )
  (let
    (
      (proposal (unwrap! (get-proposal proposal-id) ERR-INVALID-PROPOSAL))
      (voter-power (get-voting-power-of tx-sender))
      (current-block block-height)
    )
    ;; Check proposal is active
    (asserts! (>= current-block (get start-block-height proposal)) ERR-VOTING-CLOSED)
    (asserts! (< current-block (get end-block-height proposal)) ERR-VOTING-CLOSED)
    
    ;; Check voter hasn't voted yet
    (asserts! (not (has-voted proposal-id tx-sender)) ERR-ALREADY-VOTED)
    
    ;; Check valid support value (0, 1, or 2)
    (asserts! (<= support u2) (err u106))
    
    ;; Record vote
    (map-set votes
      { proposal-id: proposal-id, voter: tx-sender }
      {
        support: support,
        voting-power: voter-power,
        reason: reason
      }
    )
    
    ;; Update vote counts
    (map-set proposals
      { proposal-id: proposal-id }
      (merge proposal
        (if (is-eq support u1)
          { for-votes: (+ (get for-votes proposal) voter-power) }
          (if (is-eq support u0)
            { against-votes: (+ (get against-votes proposal) voter-power) }
            { abstain-votes: (+ (get abstain-votes proposal) voter-power) }
          )
        )
      )
    )
    
    (ok true)
  )
)

(define-public (execute (proposal-id uint))
  (let
    (
      (proposal (unwrap! (get-proposal proposal-id) ERR-INVALID-PROPOSAL))
      (current-block block-height)
    )
    ;; Check voting has ended
    (asserts! (>= current-block (get end-block-height proposal)) ERR-VOTING-CLOSED)
    
    ;; Check not already executed
    (asserts! (not (get executed proposal)) ERR-ALREADY-EXECUTED)
    
    ;; Check proposal passed
    (asserts! (>= (get for-votes proposal) QUORUM-THRESHOLD) ERR-PROPOSAL-NOT-PASSED)
    (asserts! (> (get for-votes proposal) (get against-votes proposal)) ERR-PROPOSAL-NOT-PASSED)
    
    ;; Mark as executed
    (map-set proposals
      { proposal-id: proposal-id }
      (merge proposal { executed: true })
    )
    
    ;; TODO: Execute proposal actions (call target contract)
    
    (ok true)
  )
)

(define-public (cancel (proposal-id uint))
  (let
    (
      (proposal (unwrap! (get-proposal proposal-id) ERR-INVALID-PROPOSAL))
    )
    ;; Only proposer can cancel
    (asserts! (is-eq tx-sender (get proposer proposal)) ERR-NOT-AUTHORIZED)
    
    ;; Check not executed
    (asserts! (not (get executed proposal)) ERR-ALREADY-EXECUTED)
    
    ;; Mark as cancelled
    (map-set proposals
      { proposal-id: proposal-id }
      (merge proposal { cancelled: true })
    )
    
    (ok true)
  )
)

;; Admin Functions

(define-public (set-voting-power (address principal) (power uint))
  (begin
    ;; Only contract owner can set voting power
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    
    (map-set voting-power
      { address: address }
      { power: power }
    )
    
    (ok true)
  )
)

