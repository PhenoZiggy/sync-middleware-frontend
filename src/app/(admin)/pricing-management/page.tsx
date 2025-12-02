"use client";

import { useState } from "react";
import { PencilIcon, PlusIcon, TrashBinIcon } from "@/icons";

// Dummy pricing tiers data
const initialPricingTiers = [
  {
    id: 1,
    name: "Starter",
    minUsers: 0,
    maxUsers: 100,
    pricePerUser: 8,
    isActive: true,
  },
  {
    id: 2,
    name: "Growth",
    minUsers: 100,
    maxUsers: 500,
    pricePerUser: 6,
    isActive: true,
  },
  {
    id: 3,
    name: "Professional",
    minUsers: 500,
    maxUsers: 1000,
    pricePerUser: 5,
    isActive: true,
  },
  {
    id: 4,
    name: "Enterprise",
    minUsers: 1000,
    maxUsers: 3000,
    pricePerUser: 4,
    isActive: true,
  },
  {
    id: 5,
    name: "Enterprise Plus",
    minUsers: 3000,
    maxUsers: null,
    pricePerUser: null,
    isActive: true,
  },
];

export default function PricingManagementPage() {
  const [pricingTiers, setPricingTiers] = useState(initialPricingTiers);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<typeof initialPricingTiers[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    minUsers: 0,
    maxUsers: null as number | null,
    pricePerUser: null as number | null,
  });

  const handleEdit = (tier: typeof initialPricingTiers[0]) => {
    setSelectedTier(tier);
    setFormData({
      name: tier.name,
      minUsers: tier.minUsers,
      maxUsers: tier.maxUsers,
      pricePerUser: tier.pricePerUser,
    });
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      minUsers: 0,
      maxUsers: null,
      pricePerUser: null,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedTier) {
      setPricingTiers(
        pricingTiers.map((tier) =>
          tier.id === selectedTier.id
            ? { ...tier, ...formData }
            : tier
        )
      );
      setIsEditModalOpen(false);
      setSelectedTier(null);
    }
  };

  const handleSaveAdd = () => {
    const newTier = {
      id: Math.max(...pricingTiers.map((t) => t.id)) + 1,
      ...formData,
      isActive: true,
    };
    setPricingTiers([...pricingTiers, newTier]);
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this pricing tier?")) {
      setPricingTiers(pricingTiers.filter((tier) => tier.id !== id));
    }
  };

  const toggleActive = (id: number) => {
    setPricingTiers(
      pricingTiers.map((tier) =>
        tier.id === id ? { ...tier, isActive: !tier.isActive } : tier
      )
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pricing Management
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage pricing tiers and rates for your subscription plans
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          <span className="mr-2">
            <PlusIcon />
          </span>
          Add Pricing Tier
        </button>
      </div>

      {/* Pricing Tiers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tier Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price per User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pricingTiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {tier.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {tier.minUsers} - {tier.maxUsers ? tier.maxUsers : "Unlimited"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {tier.pricePerUser ? `$${tier.pricePerUser}` : "Contact Us"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(tier.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tier.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {tier.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(tier)}
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 mr-4 inline-flex items-center"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(tier.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center"
                    >
                      <TrashBinIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Edit Pricing Tier
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tier Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Users
                </label>
                <input
                  type="number"
                  value={formData.minUsers}
                  onChange={(e) =>
                    setFormData({ ...formData, minUsers: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Users (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  value={formData.maxUsers || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsers: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price per User (leave empty for contact us)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePerUser || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerUser: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add Pricing Tier
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tier Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Users
                </label>
                <input
                  type="number"
                  value={formData.minUsers}
                  onChange={(e) =>
                    setFormData({ ...formData, minUsers: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Users (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  value={formData.maxUsers || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsers: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price per User (leave empty for contact us)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePerUser || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerUser: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveAdd}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                Add Tier
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
