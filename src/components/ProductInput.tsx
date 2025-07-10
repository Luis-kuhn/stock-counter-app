import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";

type ProductInputProps = {
    onAdd: (name: string, quantity: number) => void;
    autocompleteItems?: string[];
};

export function ProductInput({ onAdd, autocompleteItems = [] }: ProductInputProps) {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState<number | "">("");
    const [askingQuantity, setAskingQuantity] = useState(false);
    const [isAddition, setIsAddition] = useState(true); // true = +, false = -
    const inputNameRef = useRef<HTMLInputElement>(null);

    // Estado para autocomplete
    const [filteredItems, setFilteredItems] = useState<string[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    useEffect(() => {
        if (!askingQuantity) {
            inputNameRef.current?.focus();
            setIsAddition(true); // Reset para +
            setFilteredItems([]);
            setSelectedSuggestionIndex(-1);
        }
    }, [askingQuantity]);

    useEffect(() => {
        if (!name) {
            setFilteredItems([]);
            return;
        }
        // Ignorar espaços e caixa baixa para filtrar sugestões
        const norm = name.replace(/\s+/g, "").toLowerCase();

        const filtered = autocompleteItems.filter((item) =>
            item.replace(/\s+/g, "").toLowerCase().includes(norm)
        );

        setFilteredItems(filtered.slice(0, 5)); // mostra só 5 sugestões no máximo
    }, [name, autocompleteItems]);

    const handleNameKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && name.trim() !== "") {
            if (selectedSuggestionIndex >= 0 && filteredItems[selectedSuggestionIndex]) {
                setName(filteredItems[selectedSuggestionIndex]);
            }
            setAskingQuantity(true);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedSuggestionIndex((i) =>
                i < filteredItems.length - 1 ? i + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedSuggestionIndex((i) =>
                i > 0 ? i - 1 : filteredItems.length - 1
            );
        }
    };

    const handleQuantityKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && quantity !== "" && quantity > 0) {
            onAdd(name.trim(), isAddition ? quantity : -quantity);
            setName("");
            setQuantity("");
            setAskingQuantity(false);
            setIsAddition(true);
        } else if (e.key === "Escape") {
            setAskingQuantity(false);
            setQuantity("");
            setIsAddition(true);
            inputNameRef.current?.focus();
        }
    };

    return (
        <div className="mb-4 flex flex-col relative">
            {!askingQuantity && (
                <>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsAddition(!isAddition)}
                            className={`px-3 py-2 rounded font-bold ${isAddition ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                }`}
                            aria-label="Alternar adicionar/subtrair"
                        >
                            {isAddition ? "+" : "-"}
                        </button>
                        <input
                            ref={inputNameRef}
                            type="text"
                            placeholder="Enter the product name..."
                            className="flex-grow border border-gray-400 rounded px-3 py-2"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleNameKey}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>

                    {/* Lista autocomplete */}
                    {filteredItems.length > 0 && (
                        <ul className="absolute z-10 bg-white text-black border border-gray-300 rounded mt-1 w-full max-h-40 overflow-auto">
                            {filteredItems.map((item, i) => (
                                <li
                                    key={item}
                                    onClick={() => {
                                        setName(item);
                                        setFilteredItems([]);
                                        setSelectedSuggestionIndex(-1);
                                        setAskingQuantity(true);
                                    }}
                                    className={`px-3 py-1 cursor-pointer ${i === selectedSuggestionIndex
                                        ? "bg-blue-600 text-black"
                                        : "hover:bg-gray-200"
                                        }`}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}

            {askingQuantity && (
                <>
                    <div className="mb-1 text-sm text-gray-700">
                        Quantos {name}? ({isAddition ? "+" : "-"})
                    </div>
                    <input
                        type="number"
                        min={1}
                        className="w-24 border border-gray-400 rounded px-3 py-2"
                        autoFocus
                        value={quantity}
                        onChange={(e) =>
                            setQuantity(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        onKeyDown={handleQuantityKey}
                    />
                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={() => {
                                if (quantity !== "" && quantity > 0) {
                                    onAdd(name.trim(), isAddition ? quantity : -quantity);
                                    setName("");
                                    setQuantity("");
                                    setAskingQuantity(false);
                                    setIsAddition(true);
                                }
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Adicionar
                        </button>
                        <button
                            onClick={() => {
                                setAskingQuantity(false);
                                setQuantity("");
                                setIsAddition(true);
                                inputNameRef.current?.focus();
                            }}
                            className="px-3 py-2 bg-gray-400 rounded hover:bg-gray-500"
                        >
                            Cancelar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
