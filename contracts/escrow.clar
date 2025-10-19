;; BitMind Smart Invoice Escrow Contract
;; Secure escrow with input validation and authorization checks

(define-constant ERR-INVALID-AMOUNT u100)
(define-constant ERR-INVOICE-EXISTS u101)
(define-constant ERR-UNAUTHORIZED u102)
(define-constant ERR-INVALID-STATE u103)
(define-constant ERR-NOT-FOUND u104)
(define-constant ERR-NOT-CREATOR u105)
(define-constant ERR-CANNOT-CANCEL u106)
(define-constant ERR-NO-FUNDS u107)
(define-constant ERR-NOT-ARBITER-OR-PAYER u108)
(define-constant ERR-TRANSFER-FAILED u109)

;; State codes
(define-constant STATE-DRAFT u0)
(define-constant STATE-FUNDED u1)
(define-constant STATE-RELEASED u2)
(define-constant STATE-CANCELLED u3)
(define-constant STATE-DISPUTED u4)

;; Deal storage
(define-map deals
  uint
  {
    creator: principal,
    seller: principal,
    buyer: principal,
    amount: uint,
    state: uint,
    token-contract: principal,
    arbiter: principal,
    created-at: uint
  }
)

;; Create deal with validation
(define-public (create-deal (id uint) (seller principal) (buyer principal) (amount uint) (token-contract principal) (arbiter principal))
  (begin
    ;; Validate inputs
    (asserts! (> amount u0) (err ERR-INVALID-AMOUNT))
    (asserts! (is-none (map-get? deals id)) (err ERR-INVOICE-EXISTS))
    
    ;; Create deal
    (ok (map-insert deals id {
      creator: tx-sender,
      seller: seller,
      buyer: buyer,
      amount: amount,
      state: STATE-DRAFT,
      token-contract: token-contract,
      arbiter: arbiter,
      created-at: block-height
    }))
  )
)

;; Fund deal (lock tokens)
(define-public (fund-deal (id uint))
  (let ((deal (unwrap! (map-get? deals id) (err ERR-NOT-FOUND))))
    (begin
      ;; Validate caller is buyer
      (asserts! (is-eq tx-sender (get buyer deal)) (err ERR-UNAUTHORIZED))
      ;; Validate state
      (asserts! (is-eq (get state deal) STATE-DRAFT) (err ERR-INVALID-STATE))
      
      ;; Check balance
      (let ((bal (unwrap! (contract-call? .mock-token get-balance (as-contract tx-sender)) (err ERR-NO-FUNDS))))
        (asserts! (>= bal (get amount deal)) (err ERR-NO-FUNDS))
        
        ;; Update state
        (ok (map-set deals id (merge deal { state: STATE-FUNDED })))
      )
    )
  )
)

;; Release funds (buyer only)
(define-public (release (id uint))
  (let ((deal (unwrap! (map-get? deals id) (err ERR-NOT-FOUND))))
    (begin
      ;; Only buyer can release
      (asserts! (is-eq tx-sender (get buyer deal)) (err ERR-UNAUTHORIZED))
      ;; Must be funded
      (asserts! (is-eq (get state deal) STATE-FUNDED) (err ERR-INVALID-STATE))
      
      ;; Transfer to seller
      (let ((xfer (as-contract (contract-call? .mock-token transfer (get amount deal) tx-sender (get seller deal)))))
        (asserts! (is-ok xfer) (err ERR-TRANSFER-FAILED))
        
        ;; Update state
        (ok (map-set deals id (merge deal { state: STATE-RELEASED, amount: u0 })))
      )
    )
  )
)

;; Cancel deal (creator only, draft only)
(define-public (cancel (id uint))
  (let ((deal (unwrap! (map-get? deals id) (err ERR-NOT-FOUND))))
    (begin
      ;; Only creator can cancel
      (asserts! (is-eq tx-sender (get creator deal)) (err ERR-NOT-CREATOR))
      ;; Can only cancel draft
      (asserts! (is-eq (get state deal) STATE-DRAFT) (err ERR-CANNOT-CANCEL))
      
      ;; Update state
      (ok (map-set deals id (merge deal { state: STATE-CANCELLED })))
    )
  )
)

;; Refund (arbiter or buyer, funded only)
(define-public (refund (id uint))
  (let ((deal (unwrap! (map-get? deals id) (err ERR-NOT-FOUND))))
    (begin
      ;; Only arbiter or buyer
      (asserts! (or (is-eq tx-sender (get arbiter deal)) (is-eq tx-sender (get buyer deal))) (err ERR-UNAUTHORIZED))
      ;; Must be funded
      (asserts! (is-eq (get state deal) STATE-FUNDED) (err ERR-INVALID-STATE))
      
      ;; Transfer back to buyer
      (let ((xfer (as-contract (contract-call? .mock-token transfer (get amount deal) tx-sender (get buyer deal)))))
        (asserts! (is-ok xfer) (err ERR-TRANSFER-FAILED))
        
        ;; Update state
        (ok (map-set deals id (merge deal { state: STATE-CANCELLED, amount: u0 })))
      )
    )
  )
)

;; Read-only functions
(define-read-only (get-deal (id uint))
  (ok (map-get? deals id))
)

(define-read-only (get-deal-state (id uint))
  (ok (get state (unwrap! (map-get? deals id) (err ERR-NOT-FOUND))))
)

