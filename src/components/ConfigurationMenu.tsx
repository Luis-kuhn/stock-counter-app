import { useState } from "react";
import type { Tab } from "../utils/storage";

type ConfigurationMenuProps = {
    tabs: Tab[];
    currentTabId: string | null;
    setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
    setCurrentTabId: React.Dispatch<React.SetStateAction<string | null>>;
    currentWellName: string;
    setCurrentWellName: React.Dispatch<React.SetStateAction<string>>;
    onClose: () => void;
};

export function ConfigurationMenu({
    tabs,
    currentTabId,
    setTabs,
    setCurrentTabId,
    currentWellName,
    setCurrentWellName,
    onClose,
}: ConfigurationMenuProps) {
    const currentTab = tabs.find((t) => t.id === currentTabId);

    const [newTabName, setNewTabName] = useState("");
    const [newWellName, setNewWellName] = useState("");

    // Adicionar aba
    const addTab = () => {
        if (!newTabName.trim()) return;
        if (tabs.find((t) => t.name === newTabName.trim())) {
            alert("There is already a tab with that name");
            return;
        }
        const newTab: Tab = {
            id: crypto.randomUUID(),
            name: newTabName.trim(),
            wells: [],
        };
        setTabs([...tabs, newTab]);
        setCurrentTabId(newTab.id);
        setCurrentWellName("");
        setNewTabName("");
    };

    // Remover aba
    const removeTab = (id: string) => {
        if (!confirm("Remove this tab? This will delete all wells and products in it.")) return;
        const newTabs = tabs.filter((t) => t.id !== id);
        setTabs(newTabs);
        if (id === currentTabId) {
            if (newTabs.length) {
                setCurrentTabId(newTabs[0].id);
                setCurrentWellName(newTabs[0].wells[0]?.name || "");
            } else {
                setCurrentTabId(null);
                setCurrentWellName("");
            }
        }
    };

    // Renomear aba
    const renameTab = (id: string, newName: string) => {
        if (!newName.trim()) return;
        if (tabs.find((t) => t.name === newName.trim() && t.id !== id)) {
            alert("There is already a tab with that name");
            return;
        }
        const newTabs = tabs.map((t) => (t.id === id ? { ...t, name: newName.trim() } : t));
        setTabs(newTabs);
    };

    // Adicionar well na aba atual
    const addWell = () => {
        if (!newWellName.trim() || !currentTab) return;
        if (currentTab.wells.find((w) => w.name === newWellName.trim())) {
            alert("There is already a well with that name");
            return;
        }
        const newWells = [...currentTab.wells, { name: newWellName.trim(), products: [] }];
        const newTabs = tabs.map((t) =>
            t.id === currentTabId ? { ...t, wells: newWells } : t
        );
        setTabs(newTabs);
        setNewWellName("");
    };

    // Remover well
    const removeWell = (wellName: string) => {
        if (!currentTab) return;
        if (!confirm("Remove this well and all products inside?")) return;
        const newWells = currentTab.wells.filter((w) => w.name !== wellName);
        const newTabs = tabs.map((t) => (t.id === currentTabId ? { ...t, wells: newWells } : t));
        setTabs(newTabs);
        if (wellName === currentWellName) {
            setCurrentWellName(newWells[0]?.name || "");
        }
    };

    // Renomear well
    const renameWell = (oldName: string, newName: string) => {
        if (!newName.trim() || !currentTab) return;
        if (currentTab.wells.find((w) => w.name === newName.trim() && w.name !== oldName)) {
            alert("There is already a well with that name");
            return;
        }
        const newWells = currentTab.wells.map((w) =>
            w.name === oldName ? { ...w, name: newName.trim() } : w
        );
        const newTabs = tabs.map((t) => (t.id === currentTabId ? { ...t, wells: newWells } : t));
        setTabs(newTabs);
        if (oldName === currentWellName) {
            setCurrentWellName(newName.trim());
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 overflow-auto"
            onClick={onClose}
        >
            <div
                className="bg-white rounded max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">Configurações</h2>

                {/* Gerenciar abas */}
                <section className="mb-6">
                    <h3 className="font-semibold mb-2">Bares (Abas)</h3>
                    <input
                        type="text"
                        placeholder="Name of the new tab"
                        className="border p-2 rounded w-full mb-2"
                        value={newTabName}
                        onChange={(e) => setNewTabName(e.target.value)}
                    />
                    <button
                        onClick={addTab}
                        className="bg-green-600 text-white py-2 px-4 rounded mb-4 w-full"
                    >
                        Add Tab
                    </button>

                    {tabs.map((tab) => (
                        <div key={tab.id} className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                value={tab.name}
                                onChange={(e) => renameTab(tab.id, e.target.value)}
                                className="flex-grow border rounded p-1"
                            />
                            <button
                                onClick={() => removeTab(tab.id)}
                                className="bg-red-600 text-white rounded px-3 py-1"
                                title="Remover aba"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </section>

                {/* Gerenciar wells */}
                <section>
                    <h3 className="font-semibold mb-2">Wells da aba atual</h3>

                    {currentTab?.wells.map((well) => (
                        <div key={well.name} className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                value={well.name}
                                onChange={(e) => renameWell(well.name, e.target.value)}
                                className="flex-grow border rounded p-1"
                            />
                            <button
                                onClick={() => removeWell(well.name)}
                                className="bg-red-600 text-white rounded px-3 py-1"
                                title="Remover well"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    <input
                        type="text"
                        placeholder="Name of the new well"
                        className="border p-2 rounded w-full mb-2"
                        value={newWellName}
                        onChange={(e) => setNewWellName(e.target.value)}
                    />
                    <button
                        onClick={addWell}
                        className="bg-green-600 text-white py-2 px-4 rounded w-full"
                    >
                        add Well
                    </button>
                </section>

                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-gray-400 hover:bg-gray-500 text-black py-2 rounded"
                >
                    Exit
                </button>
            </div>
        </div>
    );
}
