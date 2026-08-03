import React, { useState } from "react";
import {
  Users,
  FileCheck,
  ShieldCheck,
  Search,
  Filter,
  Building2,
  Phone,
  Mail,
  Award,
  Star,
  Plus,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Download,
  Key,
  ShieldAlert,
  Droplets,
  Zap,
  Hammer,
  Sun,
  Compass,
  Landmark,
  Layers,
  Tag,
  Send,
  MessageSquare,
} from "lucide-react";
import {
  SAMPLE_VENDORS,
  SAMPLE_VENDOR_BIDS,
  SAMPLE_BINDING_CONTRACTS,
  SAMPLE_PROJECTS,
  SAMPLE_GOVT_TENDERS,
  SAMPLE_SARKAR_SUB_BIDS,
} from "../data/initialData";
import {
  Vendor,
  VendorBid,
  BindingContract,
  User,
  GovernmentAwardedTender,
  SarkarSubBid,
} from "../types";

interface VendorBindingHubProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  defaultCategoryFilter?: string;
}

export const VendorBindingHub: React.FC<VendorBindingHubProps> = ({
  currentUser,
  onOpenAuth,
  defaultCategoryFilter,
}) => {
  const [activeTab, setActiveTab] = useState<
    "sarkar_tenders" | "directory" | "bids" | "contracts"
  >("sarkar_tenders");

  // Sarkar Government Tenders state
  const [govtTenders, setGovtTenders] =
    useState<GovernmentAwardedTender[]>(SAMPLE_GOVT_TENDERS);
  const [sarkarSubBids, setSarkarSubBids] = useState<SarkarSubBid[]>(
    SAMPLE_SARKAR_SUB_BIDS,
  );
  const [selectedTenderForSubBid, setSelectedTenderForSubBid] =
    useState<GovernmentAwardedTender | null>(null);

  // Sarkar Sub-Bid Form State
  const [subBidCategory, setSubBidCategory] = useState<string>(
    "Paints & Wall Putty",
  );
  const [subBidBrand, setSubBidBrand] = useState<string>(
    "Asian Paints Royale / Birla Putty",
  );
  const [subBidUnitPrice, setSubBidUnitPrice] = useState<number>(580);
  const [subBidTotalVal, setSubBidTotalVal] = useState<number>(1350000);
  const [subBidTimelineDays, setSubBidTimelineDays] = useState<number>(14);
  const [subBidRemarks, setSubBidRemarks] = useState<string>(
    "Direct bulk distributor wholesale pricing with lab test certificates and staged site drop-off.",
  );
  const [govtCategoryFilter, setGovtCategoryFilter] = useState<string>("All");

  // Directory state
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [categoryFilter, setCategoryFilter] = useState<string>(
    defaultCategoryFilter || "All",
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Bids state
  const [bids, setBids] = useState<VendorBid[]>(SAMPLE_VENDOR_BIDS);

  // Binding Contracts state
  const [contracts, setContracts] = useState<BindingContract[]>(
    SAMPLE_BINDING_CONTRACTS,
  );

  // Modal State for New Binding Contract
  const [showContractModal, setShowContractModal] = useState<boolean>(false);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>(
    SAMPLE_PROJECTS[0].title,
  );
  const [selectedVendorName, setSelectedVendorName] = useState<string>(
    SAMPLE_VENDORS[0].name,
  );
  const [contractType, setContractType] = useState<
    | "ETP/STP Turnkey"
    | "Electrical MEP Package"
    | "Civil RCC Construction"
    | "Solar EPC Contract"
  >("ETP/STP Turnkey");
  const [agreedAmount, setAgreedAmount] = useState<number>(2650000);
  const [retentionPct, setRetentionPct] = useState<number>(5);
  const [advanceDeposit, setAdvanceDeposit] = useState<number>(265000);
  const [deadline, setDeadline] = useState<string>("2026-10-15");
  const [penaltyClause, setPenaltyClause] = useState<number>(0.5);

  // Certificate Modal view
  const [activeCert, setActiveCert] = useState<BindingContract | null>(null);

  const filteredGovtTenders = govtTenders.filter((t) => {
    if (govtCategoryFilter === "All") return true;
    return (
      t.requiredMaterialsAndSubcontracts.some((req) =>
        req.category.toLowerCase().includes(govtCategoryFilter.toLowerCase()),
      ) ||
      t.workCategory.toLowerCase().includes(govtCategoryFilter.toLowerCase())
    );
  });

  const handleOpenSubBidModal = (tender: GovernmentAwardedTender) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setSelectedTenderForSubBid(tender);
    if (tender.requiredMaterialsAndSubcontracts.length > 0) {
      const req = tender.requiredMaterialsAndSubcontracts[0];
      setSubBidCategory(req.category);
      setSubBidBrand(req.brandPreferred || "Tier-1 Approved Brand");
      setSubBidTotalVal(Math.round(req.targetEstimatedBudgetINR * 0.95));
    }
  };

  const handleSubmitSarkarSubBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenderForSubBid || !currentUser) return;

    const newSubBid: SarkarSubBid = {
      id: `SUB-BID-${Date.now().toString().slice(-4)}`,
      tenderId: selectedTenderForSubBid.id,
      tenderNumber: selectedTenderForSubBid.tenderNumber,
      biddingVendorName: currentUser.companyName || currentUser.name,
      biddingVendorRole: (currentUser.role as any) || "Dukandar",
      biddingVendorGstin: currentUser.gstinNumber || "29AAACR9988A1Z5",
      categoryOffered: subBidCategory,
      brandOffered: subBidBrand,
      quotedUnitPriceINR: Number(subBidUnitPrice),
      quotedTotalValueINR: Number(subBidTotalVal),
      deliveryTimelineDays: Number(subBidTimelineDays),
      bidStatus: "Submitted",
      bidDate: new Date().toISOString().split("T")[0],
      remarks: subBidRemarks,
    };

    setSarkarSubBids([newSubBid, ...sarkarSubBids]);
    setSelectedTenderForSubBid(null);
    alert(
      `B2B Sub-Bid for Tender #${selectedTenderForSubBid.tenderNumber} submitted directly to Prime Contractor (${selectedTenderForSubBid.primeContractorName})!`,
    );
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesCategory =
      categoryFilter === "All" || v.category === categoryFilter;
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateBindingContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const matchedVendor = vendors.find((v) => v.name === selectedVendorName);

    const newContract: BindingContract = {
      id: `BND-2026-${Math.floor(100 + Math.random() * 900)}`,
      contractNumber: `2CLICK-BIND-${Date.now().toString().slice(-5)}`,
      projectId: `PRJ-2026-00${contracts.length + 5}`,
      projectName: selectedProjectTitle,
      clientName: currentUser.name,
      vendorName: selectedVendorName,
      vendorGstin: matchedVendor
        ? matchedVendor.verifiedGstin
        : "29AAACA9988X1Z0",
      contractType,
      agreedAmountINR: Number(agreedAmount),
      retentionMoneyPct: Number(retentionPct),
      advanceDepositINR: Number(advanceDeposit),
      completionDeadline: deadline,
      bindingStatus: "Binding Deposit Escrowed",
      signedDate: new Date().toISOString().split("T")[0],
      penaltyClausePerWeekPct: Number(penaltyClause),
      digitalSignatureHash: `0x${Math.random().toString(16).slice(2, 10)}...2click_verified_sha256`,
    };

    setContracts([newContract, ...contracts]);
    setShowContractModal(false);
    setActiveTab("contracts");
    alert(
      `Binding Contract executed successfully! Advance deposit of ₹${Number(advanceDeposit).toLocaleString("en-IN")} held in 2click Escrow.`,
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Verified Vendors &amp; Legally Binding E-Contracts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Vendor Marketplace &amp; Binding Agreements Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Discover GST-verified contractors for ETP/STP Water Plants,
              Electrical/ELV, Civil Works, Solar and Interiors. Compare bids and
              execute legally binding contracts with escrow deposits &amp; SLA
              penalty clauses.
            </p>
          </div>

          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else setShowContractModal(true);
            }}
            className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition shrink-0"
          >
            <Lock className="w-4 h-4" />
            <span>Execute New Binding Agreement</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold overflow-x-auto pb-1">
        {[
          {
            id: "sarkar_tenders",
            label: "Sarkar Awarded Tenders B2B",
            icon: Landmark,
            count: govtTenders.length,
          },
          {
            id: "directory",
            label: "Verified Vendors Directory",
            icon: Users,
            count: vendors.length,
          },
          {
            id: "bids",
            label: "Vendor Bids & Tenders",
            icon: FileText,
            count: bids.length,
          },
          {
            id: "contracts",
            label: "Binding Contracts & Escrow",
            icon: Lock,
            count: contracts.length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? "border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 0: SARKAR AWARDED TENDERS B2B BIDDING SYSTEM */}
      {activeTab === "sarkar_tenders" && (
        <div className="space-y-8">
          {/* Header & Filter Controls */}
          <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/20 mb-2">
                  <Landmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>Government Awarded Tenders — B2B Procurement Hub</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Awarded Govt Infra &amp; PWD Tenders B2B Marketplace
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sub-contractors, Dukandars &amp; Material Suppliers can
                  directly bid on awarded CPWD, State PWD, NHAI &amp; Smart City
                  contracts.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200">
                  Total Active Govt Tenders: {govtTenders.length}
                </span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1">
              <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {[
                "All",
                "Paints & Wall Putty",
                "Cement & AAC Blocks",
                "TMT Steel Rebars",
                "Boundary Wall & Fencing",
                "SS & Glass Railings",
                "Kitchen & Bath",
                "Shop (Dukan) Renovation",
                "Office Renovation",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGovtCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                    govtCategoryFilter === cat
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Govt Awarded Tenders Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredGovtTenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col justify-between space-y-5 hover:border-amber-400 transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <Landmark className="w-3 h-3" />
                      {tender.issuingAuthority}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      {tender.tenderStatus}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">
                      {tender.tenderNumber}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {tender.projectTitle}
                    </h3>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] text-slate-400">
                        Awarded L1 Prime:
                      </span>
                      <span className="font-bold text-right text-slate-900 dark:text-slate-100">
                        {tender.primeContractorName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] text-slate-400">
                        GSTIN Verified:
                      </span>
                      <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {tender.primeContractorGstin}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">
                        Awarded Contract Value:
                      </span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                        ₹{(tender.awardedProjectValueINR / 10000000).toFixed(2)}{" "}
                        Cr
                      </span>
                    </div>
                  </div>

                  {/* Required Materials & Subcontracts Breakdown */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Required Materials &amp; Sub-contracts:
                    </span>
                    <div className="space-y-1.5">
                      {tender.requiredMaterialsAndSubcontracts.map(
                        (req, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {req.category}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {req.requiredQuantity} (
                                {req.brandPreferred || "Tier-1 Approved"})
                              </span>
                            </div>
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-[11px]">
                              ₹
                              {(req.targetEstimatedBudgetINR / 100000).toFixed(
                                1,
                              )}{" "}
                              L
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    <span>Deadline: </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {tender.subBiddingDeadline}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenSubBidModal(tender)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit B2B Sub-Bid</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Submitted B2B Sub-Bids Table */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Submitted B2B Sub-Bids &amp; Supplier Quotations
                </h3>
                <p className="text-xs text-slate-500">
                  Track quotations submitted by Dukandars, Suppliers &amp; Trade
                  Specialists directly to Prime Contractors.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Tender Ref</th>
                    <th className="py-3 px-3">Bidding Vendor / Dukandar</th>
                    <th className="py-3 px-3">Offered Category &amp; Brand</th>
                    <th className="py-3 px-3">Quoted Total Value</th>
                    <th className="py-3 px-3">Delivery Days</th>
                    <th className="py-3 px-3">Bid Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sarkarSubBids.map((subBid) => (
                    <tr
                      key={subBid.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="py-3 px-3 font-mono text-[11px] font-bold text-amber-600">
                        {subBid.tenderNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {subBid.biddingVendorName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          GSTIN: {subBid.biddingVendorGstin}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {subBid.categoryOffered}
                        </span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                          {subBid.brandOffered}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-extrabold text-slate-900 dark:text-white">
                        ₹{subBid.quotedTotalValueINR.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                        {subBid.deliveryTimelineDays} Days
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            subBid.bidStatus === "Shortlisted"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : subBid.bidStatus === "Accepted"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {subBid.bidStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            alert(
                              `Sub-Bid Remarks: ${subBid.remarks}\nQuoted Unit Price: ₹${subBid.quotedUnitPriceINR}\nSubmitted Date: ${subBid.bidDate}`,
                            )
                          }
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-[11px]"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SARKAR SUB-BID MODAL */}
      {selectedTenderForSubBid && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 fade-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] mb-1">
                  <Landmark className="w-3 h-3" />
                  B2B Sub-Bid Submission
                </div>
                <h2 className="text-lg font-black">
                  {selectedTenderForSubBid.projectTitle}
                </h2>
                <p className="text-xs text-slate-500">
                  Prime Contractor:{" "}
                  {selectedTenderForSubBid.primeContractorName}
                </p>
              </div>
              <button
                onClick={() => setSelectedTenderForSubBid(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmitSarkarSubBid}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Offered Sub-contract / Material Category
                  </label>
                  <select
                    value={subBidCategory}
                    onChange={(e) => setSubBidCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="Paints & Wall Putty">
                      Paints &amp; Wall Putty (Asian Paints / Birla Putty)
                    </option>
                    <option value="Cement & AAC Blocks">
                      Cement &amp; AAC Blocks (UltraTech / Ambuja / Siporex)
                    </option>
                    <option value="TMT Steel Rebars">
                      TMT Steel Rebars (Tata Tiscon / JSW Neosteel)
                    </option>
                    <option value="Bricks & Red Clay">
                      Bricks &amp; Porotherm Clay Hollow Blocks
                    </option>
                    <option value="Boundary Wall & Fencing">
                      Boundary Wall &amp; Fencing (Precast RCC / Tata Wiron)
                    </option>
                    <option value="SS & Glass Railings">
                      SS &amp; Glass Railings (Jindal SS304 / Ozone)
                    </option>
                    <option value="Kitchen & Bath Upgrades">
                      Kitchen &amp; Bathroom Upgrades (Jaquar / Sleek)
                    </option>
                    <option value="Custom Interiors & Panels">
                      Custom Interiors &amp; Panels (CenturyPly / PVC Louvers)
                    </option>
                    <option value="Shop (Dukan) Renovation">
                      Shop (Dukan) Renovation (Glass Storefronts &amp; Signage)
                    </option>
                    <option value="Office Renovation">
                      Office Renovation (Acoustic Glass Partitions)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Brand &amp; Product Specification Offered
                  </label>
                  <input
                    type="text"
                    value={subBidBrand}
                    onChange={(e) => setSubBidBrand(e.target.value)}
                    placeholder="e.g. UltraTech OPC 53 / Asian Paints Royale"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quoted Unit Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={subBidUnitPrice}
                    onChange={(e) => setSubBidUnitPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Package Value (₹)
                  </label>
                  <input
                    type="number"
                    value={subBidTotalVal}
                    onChange={(e) => setSubBidTotalVal(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supply Timeline (Days)
                  </label>
                  <input
                    type="number"
                    value={subBidTimelineDays}
                    onChange={(e) =>
                      setSubBidTimelineDays(Number(e.target.value))
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  B2B Supplier Remarks &amp; Compliance Certificates
                </label>
                <textarea
                  value={subBidRemarks}
                  onChange={(e) => setSubBidRemarks(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  placeholder="Mention test certificates, GSTIN invoice terms, delivery schedule, etc."
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold">✓ Direct B2B Verification Notice:</p>
                <p>
                  Your quotation will be transmitted directly to L1 Prime
                  Contractor ({selectedTenderForSubBid.primeContractorName}).
                  Once shortlisted, a 2click binding escrow deposit contract can
                  be established.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTenderForSubBid(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit B2B Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: VERIFIED VENDORS DIRECTORY */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          {/* Search & Category Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor name, specialization or city..."
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium w-full sm:w-72"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                "All",
                "ETP/STP Water",
                "Electrical & ELV",
                "Civil Contractor",
                "Solar Rooftop",
                "Interior Architecture",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    categoryFilter === cat
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-[10px] border border-teal-200 dark:border-teal-800">
                      {vendor.category}
                    </span>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>
                        {vendor.rating} ({vendor.reviewsCount})
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {vendor.specialization}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>GSTIN Verification:</span>
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                        {vendor.verifiedGstin}
                      </span>
                    </div>

                    {vendor.cpwdClassLicense && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>CPWD / License:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {vendor.cpwdClassLicense}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Projects Completed:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {vendor.projectsCompleted}+ Projects
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-2">
                  <div className="text-xs">
                    <span className="text-slate-400">Location: </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {vendor.city}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (!currentUser) onOpenAuth();
                      else {
                        setSelectedVendorName(vendor.name);
                        setShowContractModal(true);
                      }
                    }}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Lock className="w-3.5 h-3.5" /> Bind Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: VENDOR BIDS & TENDERS */}
      {activeTab === "bids" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {bid.id}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {bid.projectName}
                    </h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-0.5">
                      Bidder: {bid.vendorName}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      ₹{bid.bidAmountINR.toLocaleString("en-IN")}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      {bid.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold">Scope &amp; Terms: </span>
                  {bid.scopeNotes}
                </p>

                <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 pt-2 gap-4">
                  <div className="flex gap-4">
                    <span>
                      Delivery Time:{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {bid.deliveryDays} Days
                      </strong>
                    </span>
                    <span>
                      Warranty:{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {bid.warrantyYears} Years SLA
                      </strong>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProjectTitle(bid.projectName);
                      setSelectedVendorName(bid.vendorName);
                      setAgreedAmount(bid.bidAmountINR);
                      setAdvanceDeposit(Math.round(bid.bidAmountINR * 0.1));
                      setShowContractModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" /> Accept &amp; Create Binding
                    Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BINDING CONTRACTS & ESCROW */}
      {activeTab === "contracts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {contracts.map((cnt) => (
              <div
                key={cnt.id}
                className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {cnt.contractNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {cnt.bindingStatus}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                      {cnt.projectName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono">
                      ₹{cnt.agreedAmountINR.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Escrow Advance: ₹
                      {cnt.advanceDepositINR.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400">
                      Client Signature
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {cnt.clientName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">
                      Bound Vendor (GSTIN)
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {cnt.vendorName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">
                      Completion Deadline
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {cnt.completionDeadline}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">
                      Delay Penalty Clause
                    </div>
                    <div className="font-bold text-amber-600 dark:text-amber-400">
                      {cnt.penaltyClausePerWeekPct}% per week
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                    SHA256 Hash: {cnt.digitalSignatureHash}
                  </div>

                  <button
                    onClick={() => setActiveCert(cnt)}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition text-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Binding
                    Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW BINDING CONTRACT MODAL */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 fade-in">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-600" />
              Execute Legally Binding Vendor Agreement
            </h3>

            <form
              onSubmit={handleCreateBindingContract}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Project
                </label>
                <input
                  type="text"
                  required
                  value={selectedProjectTitle}
                  onChange={(e) => setSelectedProjectTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Selected Verified Vendor
                </label>
                <select
                  value={selectedVendorName}
                  onChange={(e) => setSelectedVendorName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agreed Value (₹)
                  </label>
                  <input
                    type="number"
                    value={agreedAmount}
                    onChange={(e) => setAgreedAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Advance Escrow Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={advanceDeposit}
                    onChange={(e) => setAdvanceDeposit(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Completion Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Delay Penalty (%/Week)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={penaltyClause}
                    onChange={(e) => setPenaltyClause(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-[11px] text-teal-900 dark:text-teal-200 space-y-1">
                <div className="font-bold">E-Signature Binding Legal Term:</div>
                <p>
                  By clicking execute, this contract is digitally signed and
                  bound under the Indian Information Technology Act 2000 &amp;
                  CPWD Escrow Norms.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  Sign &amp; Bind Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BINDING CERTIFICATE VIEW MODAL */}
      {activeCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-8 shadow-2xl relative space-y-6 fade-in text-slate-900 dark:text-white">
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-wider">
                2click.in Digital Binding Certificate
              </h2>
              <p className="text-xs text-slate-500">
                Contract Ref: {activeCert.contractNumber}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Project Title:</span>
                <span className="font-bold">{activeCert.projectName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Client Name:</span>
                <span className="font-bold">{activeCert.clientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Bound Vendor (GSTIN):</span>
                <span className="font-bold">
                  {activeCert.vendorName} ({activeCert.vendorGstin})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">
                  Total Agreed Contract Value:
                </span>
                <span className="font-extrabold text-teal-600 font-mono">
                  ₹{activeCert.agreedAmountINR.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Escrow Advance Deposit:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  ₹{activeCert.advanceDepositINR.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Target Completion Date:</span>
                <span className="font-bold">
                  {activeCert.completionDeadline}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">
                  SLA Delay Penalty Clause:
                </span>
                <span className="font-bold text-amber-600">
                  {activeCert.penaltyClausePerWeekPct}% penalty per week of
                  delay
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl font-mono text-[10px] text-slate-500 break-all">
              Digital Signature Fingerprint: {activeCert.digitalSignatureHash}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveCert(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Downloading official binding agreement PDF...");
                  setActiveCert(null);
                }}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
