import Foundation
import React
import ZeroSettleKit
import SwiftUI

// MARK: - ISO 8601 Formatter

private let iso8601Formatter: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return f
}()

// MARK: - ZeroSettleKitModule

@objc(ZeroSettleKitModule)
class ZeroSettleKitModule: RCTEventEmitter {

    // MARK: - Event Emitter Setup

    private var hasListeners = false

    override func supportedEvents() -> [String]! {
        return [
            "checkoutDidBegin",
            "checkoutDidComplete",
            "checkoutDidCancel",
            "checkoutDidFail",
            "entitlementsDidUpdate",
            "didSyncStoreKitTransaction",
            "storeKitSyncFailed",
        ]
    }

    override func startObserving() { hasListeners = true }
    override func stopObserving() { hasListeners = false }

    @objc override static func requiresMainQueueSetup() -> Bool { return false }

    // MARK: - Configuration & Lifecycle

    @objc func configure(
        _ publishableKey: String,
        syncStoreKitTransactions: Bool,
        appleMerchantId: String?,
        preloadCheckout: Bool,
        maxPreloadedWebViews: NSNumber?
    ) {
        Task { @MainActor in
            let config = ZeroSettle.Configuration(
                publishableKey: publishableKey,
                syncStoreKitTransactions: syncStoreKitTransactions,
                appleMerchantId: appleMerchantId,
                preloadCheckout: preloadCheckout,
                maxPreloadedWebViews: maxPreloadedWebViews?.intValue
            )
            ZeroSettle.shared.configure(config)
            ZeroSettle.shared.delegate = self
        }
    }

    @objc func bootstrap(
        _ userId: String,
        name: String?,
        email: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                let catalog = try await ZeroSettle.shared.bootstrap(
                    userId: userId,
                    name: name,
                    email: email
                )
                resolve(Self.catalogToMap(catalog))
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    @objc func logout() {
        Task { @MainActor in
            ZeroSettle.shared.logout()
        }
    }

    @objc func setCustomer(_ name: String?, email: String?) {
        Task { @MainActor in
            ZeroSettle.shared.setCustomer(name: name, email: email)
        }
    }

    @objc func getIsConfigured(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            resolve(ZeroSettle.shared.isConfigured)
        }
    }

    @objc func getIsBootstrapped(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            resolve(ZeroSettle.shared.isBootstrapped)
        }
    }

    // MARK: - Products

    @objc func fetchProducts(
        _ userId: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                let catalog = try await ZeroSettle.shared.fetchProducts(userId: userId)
                resolve(Self.catalogToMap(catalog))
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    @objc func getProducts(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            let products = ZeroSettle.shared.products.map { Self.productToMap($0) }
            resolve(products)
        }
    }

    @objc func getProduct(
        _ productId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            if let product = ZeroSettle.shared.product(for: productId) {
                resolve(Self.productToMap(product))
            } else {
                reject("product_not_found", "Product not found: \(productId)", nil)
            }
        }
    }

    // MARK: - Checkout

    @objc func purchase(
        _ productId: String,
        userId: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                let transaction = try await ZeroSettle.shared.purchase(
                    productId: productId,
                    userId: userId
                )
                resolve(Self.transactionToMap(transaction))
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    @objc func handleUniversalLink(
        _ url: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            guard let linkURL = URL(string: url) else {
                reject("invalid_url", "Invalid URL: \(url)", nil)
                return
            }
            let handled = ZeroSettle.shared.handleUniversalLink(linkURL)
            resolve(handled)
        }
    }

    @objc func getPendingCheckout(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            resolve(ZeroSettle.shared.pendingCheckout)
        }
    }

    @objc func warmUp(
        _ productId: String,
        userId: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            await CheckoutSheet<EmptyView>.warmUp(productId: productId, userId: userId)
            resolve(nil)
        }
    }

    @objc func warmUpAll(
        _ userId: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            await CheckoutSheet<EmptyView>.warmUpAll(userId: userId)
            resolve(nil)
        }
    }

    // MARK: - Entitlements

    @objc func restoreEntitlements(
        _ userId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                let entitlements = try await ZeroSettle.shared.restoreEntitlements(userId: userId)
                resolve(entitlements.map { Self.entitlementToMap($0) })
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    @objc func getEntitlements(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            let entitlements = ZeroSettle.shared.entitlements.map { Self.entitlementToMap($0) }
            resolve(entitlements)
        }
    }

    @objc func getActiveEntitlements(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            let entitlements = ZeroSettle.shared.activeEntitlements.map { Self.entitlementToMap($0) }
            resolve(entitlements)
        }
    }

    @objc func hasActiveEntitlement(
        _ productId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            resolve(ZeroSettle.shared.hasActiveEntitlement(for: productId))
        }
    }

    // MARK: - Transactions

    @objc func fetchTransactionHistory(
        _ userId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                let transactions = try await ZeroSettle.shared.fetchTransactionHistory(userId: userId)
                resolve(transactions.map { Self.transactionToMap($0) })
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    // MARK: - Cancel Flow

    @objc func presentCancelFlow(
        _ productId: String,
        userId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            let cancelResult = await ZeroSettle.shared.presentCancelFlow(
                productId: productId,
                userId: userId
            )
            switch cancelResult {
            case .cancelled: resolve("cancelled")
            case .retained: resolve("retained")
            case .dismissed: resolve("dismissed")
            case .paused(let resumesAt):
                if let resumesAt {
                    resolve("paused:" + iso8601Formatter.string(from: resumesAt))
                } else {
                    resolve("paused:")
                }
            }
        }
    }

    @objc func fetchCancelFlowConfig(
        _ userId: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                let config = try await ZeroSettle.shared.fetchCancelFlowConfig(userId: userId)
                resolve(Self.cancelFlowConfigToMap(config))
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    @objc func getCancelFlowConfig(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            if let config = ZeroSettle.shared.cancelFlowConfig {
                resolve(Self.cancelFlowConfigToMap(config))
            } else {
                resolve(nil)
            }
        }
    }

    @objc func acceptSaveOffer(
        _ productId: String,
        userId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                let result = try await ZeroSettle.shared.acceptSaveOffer(
                    productId: productId,
                    userId: userId
                )
                var map: [String: Any] = ["message": result.message]
                if let discountPercent = result.discountPercent {
                    map["discountPercent"] = discountPercent
                }
                if let durationMonths = result.durationMonths {
                    map["durationMonths"] = durationMonths
                }
                resolve(map)
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    @objc func submitCancelFlowResponse(
        _ responseMap: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            let answers = (responseMap["answers"] as? [[String: Any]])?.map { answerMap in
                CancelFlow.Answer(
                    questionId: answerMap["questionId"] as? Int ?? 0,
                    selectedOptionId: answerMap["selectedOptionId"] as? Int,
                    freeText: answerMap["freeText"] as? String
                )
            } ?? []

            let outcome: CancelFlow.Outcome
            switch responseMap["outcome"] as? String {
            case "cancelled": outcome = .cancelled
            case "retained": outcome = .retained
            case "paused": outcome = .paused
            case "dismissed": outcome = .dismissed
            default: outcome = .cancelled
            }

            let response = CancelFlow.Response(
                productId: responseMap["productId"] as? String ?? "",
                userId: responseMap["userId"] as? String ?? "",
                outcome: outcome,
                answers: answers,
                offerShown: responseMap["offerShown"] as? Bool ?? false,
                offerAccepted: responseMap["offerAccepted"] as? Bool ?? false,
                pauseShown: responseMap["pauseShown"] as? Bool ?? false,
                pauseAccepted: responseMap["pauseAccepted"] as? Bool ?? false,
                pauseDurationDays: responseMap["pauseDurationDays"] as? Int
            )

            await ZeroSettle.shared.submitCancelFlowResponse(response)
            resolve(nil)
        }
    }

    @objc func pauseSubscription(
        _ productId: String,
        userId: String,
        pauseDurationDays: NSNumber?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                let resumesAt = try await ZeroSettle.shared.pauseSubscription(
                    productId: productId,
                    userId: userId,
                    pauseDurationDays: pauseDurationDays?.intValue
                )
                if let resumesAt {
                    resolve(iso8601Formatter.string(from: resumesAt))
                } else {
                    resolve(nil)
                }
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    @objc func resumeSubscription(
        _ productId: String,
        userId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                try await ZeroSettle.shared.resumeSubscription(
                    productId: productId,
                    userId: userId
                )
                resolve(nil)
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    @objc func cancelSubscription(
        _ productId: String,
        userId: String,
        immediate: Bool,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                try await ZeroSettle.shared.cancelSubscription(
                    productId: productId,
                    userId: userId,
                    immediate: immediate
                )
                resolve(nil)
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    // MARK: - Upgrade Offer

    @objc func presentUpgradeOffer(
        _ productId: String?,
        userId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            let upgradeResult = await ZeroSettle.shared.presentUpgradeOffer(
                productId: productId,
                userId: userId
            )
            switch upgradeResult {
            case .upgraded: resolve("upgraded")
            case .declined: resolve("declined")
            case .dismissed: resolve("dismissed")
            }
        }
    }

    @objc func fetchUpgradeOfferConfig(
        _ productId: String?,
        userId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                let config = try await ZeroSettle.shared.fetchUpgradeOfferConfig(
                    productId: productId,
                    userId: userId
                )
                resolve(Self.upgradeOfferConfigToMap(config))
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    // MARK: - Migration

    @objc func getMigrationManager(
        _ userId: String,
        stripeCustomerId: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            let manager = ZeroSettle.shared.migrationManager(
                for: userId,
                stripeCustomerId: stripeCustomerId
            )
            var map: [String: Any] = [
                "state": Self.migrationStateString(manager.state),
                "isLoading": manager.isLoading,
                "storekitCancelRequired": manager.storekitCancelRequired,
            ]
            if let offerData = manager.offerData {
                map["offerData"] = Self.migrationOfferDataToMap(offerData)
            }
            if let error = manager.checkoutError {
                map["checkoutError"] = error.localizedDescription
            }
            resolve(map)
        }
    }

    @objc func trackMigrationConversion(
        _ userId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                try await ZeroSettle.shared.trackMigrationConversion(userId: userId)
                resolve(nil)
            } catch {
                Self.rejectWithZSError(error, reject: reject)
            }
        }
    }

    @objc func resetMigrateTipState() {
        DispatchQueue.main.async {
            ZSMigrationManager.resetDismissedState()
        }
    }

    @objc func presentMigrateTip(_ backgroundColorHex: String, userId: String) {
        DispatchQueue.main.async {
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootVC = windowScene.windows.first?.rootViewController else {
                return
            }

            var topVC = rootVC
            while let presented = topVC.presentedViewController {
                topVC = presented
            }

            let uiColor = UIColor(zsHex: backgroundColorHex) ?? .black
            let swiftUIColor = Color(uiColor)

            let migrateTipView = MigrationTipView(userId: userId, backgroundColor: swiftUIColor)

            let hostingController = UIHostingController(rootView:
                ZStack {
                    Color.black.opacity(0.5)
                        .ignoresSafeArea()
                        .onTapGesture {
                            topVC.presentedViewController?.dismiss(animated: true)
                        }

                    VStack {
                        Spacer()
                        migrateTipView
                            .padding(.horizontal, 16)
                            .padding(.bottom, 34)
                    }
                }
            )

            hostingController.view.backgroundColor = .clear
            hostingController.modalPresentationStyle = .overFullScreen
            hostingController.modalTransitionStyle = .crossDissolve

            topVC.present(hostingController, animated: true)
        }
    }

    @objc func dismissMigrateTip() {
        DispatchQueue.main.async {
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootVC = windowScene.windows.first?.rootViewController else {
                return
            }

            var topVC = rootVC
            while let presented = topVC.presentedViewController {
                topVC = presented
            }

            if topVC != rootVC {
                topVC.dismiss(animated: true)
            }
        }
    }

    // MARK: - Manage Subscription Sheet

    @objc func presentManageSubscriptionSheet(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootVC = windowScene.windows.first?.rootViewController else {
                reject("no_view_controller", "Could not find root view controller", nil)
                return
            }

            var topVC = rootVC
            while let presented = topVC.presentedViewController {
                topVC = presented
            }

            RetentionSheet.present(from: topVC) { result in
                switch result {
                case .pauseAccount:
                    resolve("pauseAccount")
                case .stayWithDiscount:
                    resolve("stayWithDiscount")
                case .cancelSubscription:
                    resolve("cancelSubscription")
                case .dismissed:
                    resolve("dismissed")
                }
            }
        }
    }

    @objc func dismissManageSubscriptionSheet() {
        DispatchQueue.main.async {
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootVC = windowScene.windows.first?.rootViewController else {
                return
            }

            var topVC = rootVC
            while let presented = topVC.presentedViewController {
                topVC = presented
            }

            if topVC != rootVC {
                topVC.dismiss(animated: true)
            }
        }
    }

    // MARK: - Analytics

    @objc func trackEvent(
        _ eventType: String,
        productId: String,
        screenName: String?,
        metadata: NSDictionary?
    ) {
        guard let funnelType = FunnelEventType(rawValue: eventType) else {
            return
        }
        let meta = metadata as? [String: String]
        ZeroSettle.trackEvent(funnelType, productId: productId, screenName: screenName, metadata: meta)
    }

    // MARK: - Event Listener Stubs

    @objc func addListener(_ eventName: String) {
        // no-op, handled by RCTEventEmitter
    }

    @objc func removeListeners(_ count: Double) {
        // no-op
    }

    // MARK: - Serializers

    private static func productToMap(_ product: ZSProduct) -> [String: Any] {
        var map: [String: Any] = [
            "id": product.id,
            "displayName": product.displayName,
            "productDescription": product.productDescription,
            "type": product.type.rawValue,
            "syncedToAppStoreConnect": product.syncedToAppStoreConnect,
            "storeKitAvailable": product.storeKitAvailable,
        ]
        if let webPrice = product.webPrice {
            map["webPrice"] = priceToMap(webPrice)
        }
        if let appStorePrice = product.appStorePrice {
            map["appStorePrice"] = priceToMap(appStorePrice)
        }
        if let promotion = product.promotion {
            map["promotion"] = promotionToMap(promotion)
        }
        if let storeKitPrice = product.storeKitPrice {
            map["storeKitPrice"] = priceToMap(storeKitPrice)
        }
        if let savingsPercent = product.savingsPercent {
            map["savingsPercent"] = savingsPercent
        }
        return map
    }

    private static func priceToMap(_ price: Price) -> [String: Any] {
        return [
            "amountCents": price.amountCents,
            "currencyCode": price.currencyCode,
        ]
    }

    private static func promotionToMap(_ promotion: Promotion) -> [String: Any] {
        var map: [String: Any] = [
            "id": promotion.id,
            "displayName": promotion.displayName,
            "promotionalPrice": priceToMap(promotion.promotionalPrice),
            "type": promotion.type.rawValue,
        ]
        if let expiresAt = promotion.expiresAt {
            map["expiresAt"] = iso8601Formatter.string(from: expiresAt)
        }
        return map
    }

    private static func entitlementToMap(_ entitlement: Entitlement) -> [String: Any] {
        var map: [String: Any] = [
            "id": entitlement.id,
            "productId": entitlement.productId,
            "source": entitlement.source.rawValue,
            "isActive": entitlement.isActive,
            "purchasedAt": iso8601Formatter.string(from: entitlement.purchasedAt),
        ]
        if let expiresAt = entitlement.expiresAt {
            map["expiresAt"] = iso8601Formatter.string(from: expiresAt)
        }
        map["status"] = entitlement.status.rawString
        if let pausedAt = entitlement.pausedAt {
            map["pausedAt"] = iso8601Formatter.string(from: pausedAt)
        }
        if let pauseResumesAt = entitlement.pauseResumesAt {
            map["pauseResumesAt"] = iso8601Formatter.string(from: pauseResumesAt)
        }
        map["willRenew"] = entitlement.willRenew
        map["isTrial"] = entitlement.isTrial
        if let trialEndsAt = entitlement.trialEndsAt {
            map["trialEndsAt"] = iso8601Formatter.string(from: trialEndsAt)
        }
        if let cancelledAt = entitlement.cancelledAt {
            map["cancelledAt"] = iso8601Formatter.string(from: cancelledAt)
        }
        return map
    }

    private static func transactionToMap(_ transaction: CheckoutTransaction) -> [String: Any] {
        var map: [String: Any] = [
            "id": transaction.id,
            "productId": transaction.productId,
            "status": transaction.status.rawValue,
            "source": transaction.source.rawValue,
            "purchasedAt": iso8601Formatter.string(from: transaction.purchasedAt),
        ]
        if let expiresAt = transaction.expiresAt {
            map["expiresAt"] = iso8601Formatter.string(from: expiresAt)
        }
        if let productName = transaction.productName {
            map["productName"] = productName
        }
        if let amountCents = transaction.amountCents {
            map["amountCents"] = amountCents
        }
        if let currency = transaction.currency {
            map["currency"] = currency
        }
        return map
    }

    private static func catalogToMap(_ catalog: ProductCatalog) -> [String: Any] {
        var map: [String: Any] = [
            "products": catalog.products.map { productToMap($0) },
        ]
        if let config = catalog.config {
            map["config"] = remoteConfigToMap(config)
        }
        return map
    }

    private static func remoteConfigToMap(_ config: RemoteConfig) -> [String: Any] {
        var map: [String: Any] = [
            "checkout": checkoutConfigToMap(config.checkout),
        ]
        if let migration = config.migration {
            map["migration"] = migrationPromptToMap(migration)
        }
        return map
    }

    private static func checkoutConfigToMap(_ config: CheckoutConfig) -> [String: Any] {
        var jurisdictionsMap: [String: Any] = [:]
        for (key, value) in config.jurisdictions {
            jurisdictionsMap[key.rawValue] = [
                "sheetType": value.sheetType.rawValue,
                "isEnabled": value.isEnabled,
            ] as [String: Any]
        }
        return [
            "sheetType": config.sheetType.rawValue,
            "isEnabled": config.isEnabled,
            "jurisdictions": jurisdictionsMap,
        ]
    }

    private static func migrationPromptToMap(_ prompt: MigrationPrompt) -> [String: Any] {
        return [
            "productId": prompt.productId,
            "discountPercent": prompt.discountPercent,
            "title": prompt.title,
            "message": prompt.message,
            "ctaText": prompt.ctaText,
        ]
    }

    private static func cancelFlowConfigToMap(_ config: CancelFlow.Config) -> [String: Any] {
        var map: [String: Any] = [
            "enabled": config.enabled,
            "questions": config.questions.map { question in
                [
                    "id": question.id,
                    "order": question.order,
                    "questionText": question.questionText,
                    "questionType": question.questionType.rawValue,
                    "isRequired": question.isRequired,
                    "options": question.options.map { option in
                        [
                            "id": option.id,
                            "order": option.order,
                            "label": option.label,
                            "triggersOffer": option.triggersOffer,
                            "triggersPause": option.triggersPause,
                        ] as [String: Any]
                    },
                ] as [String: Any]
            },
        ]
        if let offer = config.offer {
            map["offer"] = [
                "enabled": offer.enabled,
                "title": offer.title,
                "body": offer.body,
                "ctaText": offer.ctaText,
                "type": offer.type.rawString,
                "value": offer.value,
            ] as [String: Any]
        }
        if let pause = config.pause {
            map["pause"] = [
                "enabled": pause.enabled,
                "title": pause.title,
                "body": pause.body,
                "ctaText": pause.ctaText,
                "options": pause.options.map { option in
                    var optMap: [String: Any] = [
                        "id": option.id,
                        "order": option.order,
                        "label": option.label,
                        "durationType": option.durationType.rawValue,
                    ]
                    if let durationDays = option.durationDays {
                        optMap["durationDays"] = durationDays
                    }
                    if let resumeDate = option.resumeDate {
                        optMap["resumeDate"] = iso8601Formatter.string(from: resumeDate)
                    }
                    return optMap
                },
            ] as [String: Any]
        }
        if let variantId = config.variantId {
            map["variantId"] = variantId
        }
        return map
    }

    private static func upgradeOfferConfigToMap(_ config: UpgradeOffer.Config) -> [String: Any] {
        var map: [String: Any] = ["available": config.available]
        if let reason = config.reason { map["reason"] = reason.rawString }
        if let currentProduct = config.currentProduct {
            map["currentProduct"] = upgradeProductInfoToMap(currentProduct)
        }
        if let targetProduct = config.targetProduct {
            map["targetProduct"] = upgradeProductInfoToMap(targetProduct)
        }
        if let savingsPercent = config.savingsPercent { map["savingsPercent"] = savingsPercent }
        if let upgradeType = config.upgradeType { map["upgradeType"] = upgradeType.rawValue }
        if let proration = config.proration { map["proration"] = prorationToMap(proration) }
        if let display = config.display { map["display"] = displayToMap(display) }
        if let variantId = config.variantId { map["variantId"] = variantId }
        return map
    }

    private static func upgradeProductInfoToMap(_ info: UpgradeOffer.ProductInfo) -> [String: Any] {
        var map: [String: Any] = [
            "referenceId": info.referenceId,
            "name": info.name,
            "priceCents": info.price.amountCents,
            "currency": info.price.currencyCode,
            "durationDays": 0,
            "billingLabel": info.billingLabel,
        ]
        if let monthlyEquivalent = info.monthlyEquivalent {
            map["monthlyEquivalentCents"] = monthlyEquivalent.amountCents
        }
        return map
    }

    private static func prorationToMap(_ proration: UpgradeOffer.Proration) -> [String: Any] {
        var map: [String: Any] = [
            "prorationAmountCents": proration.amountCents,
            "currency": proration.currency,
        ]
        if let nextBillingDate = proration.nextBillingDate {
            map["nextBillingDate"] = Int(nextBillingDate.timeIntervalSince1970)
        }
        return map
    }

    private static func displayToMap(_ display: UpgradeOffer.Display) -> [String: Any] {
        var map: [String: Any] = [
            "title": display.title,
            "body": display.body,
            "ctaText": display.ctaText,
            "dismissText": display.dismissText,
        ]
        if let storekitMigrationBody = display.storekitMigrationBody {
            map["storekitMigrationBody"] = storekitMigrationBody
        }
        if let storekitCancelInstructions = display.storekitCancelInstructions {
            map["cancelInstructions"] = storekitCancelInstructions
        }
        return map
    }

    private static func migrationStateString(_ state: MigrationOffer.State) -> String {
        switch state {
        case .loading: return "loading"
        case .ineligible: return "ineligible"
        case .eligible: return "eligible"
        case .presented: return "presented"
        case .accepted: return "accepted"
        case .completed: return "completed"
        case .dismissed: return "dismissed"
        }
    }

    private static func migrationOfferDataToMap(_ data: MigrationOffer.OfferData) -> [String: Any] {
        var map: [String: Any] = [
            "prompt": migrationPromptToMap(data.prompt),
            "freeTrialDays": data.freeTrialDays,
            "activeStoreKitProductId": data.activeStoreKitProductId,
        ]
        if let storekitSubscriptionEnd = data.storekitSubscriptionEnd {
            map["storekitSubscriptionEnd"] = iso8601Formatter.string(from: storekitSubscriptionEnd)
        }
        if let originalTransactionId = data.activeStoreKitOriginalTransactionId {
            map["activeStoreKitOriginalTransactionId"] = originalTransactionId
        }
        return map
    }

    // MARK: - Error Handling

    private static func rejectWithZSError(_ error: Error, reject: RCTPromiseRejectBlock) {
        if let zsError = error as? ZeroSettleError {
            switch zsError {
            case .notConfigured:
                reject("not_configured", zsError.errorDescription, zsError)
            case .invalidPublishableKey:
                reject("invalid_publishable_key", zsError.errorDescription, zsError)
            case .productNotFound(let id):
                reject("product_not_found", "Product not found: \(id)", zsError)
            case .checkoutFailed(let reason):
                let msg: String
                switch reason {
                case .productNotFound:
                    msg = "Checkout failed: product not found."
                case .merchantNotOnboarded:
                    msg = "Checkout failed: merchant not onboarded."
                case .stripeError(_, let message):
                    msg = "Payment error: \(message)"
                case .serverError(let statusCode, let message):
                    msg = "Server error (\(statusCode))\(message.map { " — \($0)" } ?? "")"
                case .networkUnavailable:
                    msg = "No network connection."
                case .other(let message):
                    msg = message
                }
                reject("checkout_failed", msg, zsError)
            case .transactionVerificationFailed(let message):
                reject("transaction_verification_failed", message, zsError)
            case .apiError(let detail):
                reject("api_error", detail.serverMessage ?? "API error", zsError)
            case .invalidCallbackURL:
                reject("invalid_callback_url", zsError.errorDescription, zsError)
            case .webCheckoutDisabledForJurisdiction(let jurisdiction):
                reject("web_checkout_disabled", zsError.errorDescription ?? "Web checkout disabled for \(jurisdiction.rawValue)", zsError)
            case .userIdRequired(let productId):
                reject("user_id_required", "userId is required for \(productId)", zsError)
            case .restoreEntitlementsFailed:
                reject("restore_entitlements_failed", zsError.errorDescription, zsError)
            case .cancelled:
                reject("cancelled", "Operation cancelled by user", zsError)
            case .purchasePending:
                reject("purchase_pending", "Purchase pending approval", zsError)
            case .storeKitVerificationFailed:
                reject("storekit_verification_failed", zsError.errorDescription, zsError)
            case .invalidUserId:
                reject("invalid_user_id", zsError.errorDescription, zsError)
            }
        } else {
            reject("unknown", error.localizedDescription, error)
        }
    }

    // MARK: - View Controller Helpers

    @MainActor
    private static func topViewController() -> UIViewController? {
        guard let scene = UIApplication.shared.connectedScenes
                .compactMap({ $0 as? UIWindowScene })
                .first(where: { $0.activationState == .foregroundActive }),
              let rootVC = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController else {
            return nil
        }
        var top = rootVC
        while let presented = top.presentedViewController {
            top = presented
        }
        return top
    }
}

// MARK: - ZeroSettleDelegate

extension ZeroSettleKitModule: ZeroSettleDelegate {

    func zeroSettleCheckoutDidBegin(productId: String) {
        guard hasListeners else { return }
        sendEvent(withName: "checkoutDidBegin", body: ["productId": productId])
    }

    func zeroSettleCheckoutDidComplete(transaction: CheckoutTransaction) {
        guard hasListeners else { return }
        sendEvent(withName: "checkoutDidComplete", body: Self.transactionToMap(transaction))
    }

    func zeroSettleCheckoutDidCancel(productId: String) {
        guard hasListeners else { return }
        sendEvent(withName: "checkoutDidCancel", body: ["productId": productId])
    }

    func zeroSettleCheckoutDidFail(productId: String, error: Error) {
        guard hasListeners else { return }
        sendEvent(withName: "checkoutDidFail", body: [
            "productId": productId,
            "error": error.localizedDescription,
        ])
    }

    func zeroSettleEntitlementsDidUpdate(_ entitlements: [Entitlement]) {
        guard hasListeners else { return }
        sendEvent(
            withName: "entitlementsDidUpdate",
            body: entitlements.map { Self.entitlementToMap($0) }
        )
    }

    func zeroSettleDidSyncStoreKitTransaction(productId: String, transactionId: UInt64) {
        guard hasListeners else { return }
        sendEvent(withName: "didSyncStoreKitTransaction", body: [
            "productId": productId,
            "transactionId": transactionId,
        ])
    }

    func zeroSettleStoreKitSyncFailed(error: Error) {
        guard hasListeners else { return }
        sendEvent(withName: "storeKitSyncFailed", body: [
            "error": error.localizedDescription,
        ])
    }
}

// MARK: - UIColor hex helper

private extension UIColor {
    convenience init?(zsHex hex: String) {
        var s = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        if s.hasPrefix("#") { s.removeFirst() }
        guard s.count == 6 else { return nil }
        var rgb: UInt64 = 0
        guard Scanner(string: s).scanHexInt64(&rgb) else { return nil }
        self.init(
            red: CGFloat((rgb & 0xFF0000) >> 16) / 255.0,
            green: CGFloat((rgb & 0x00FF00) >> 8) / 255.0,
            blue: CGFloat(rgb & 0x0000FF) / 255.0,
            alpha: 1.0
        )
    }
}
