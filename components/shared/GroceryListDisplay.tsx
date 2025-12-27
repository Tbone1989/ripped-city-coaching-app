import React from 'react';
import type { StructuredGroceryList } from '../../types.ts';
import { Card } from '../ui/common.tsx';

const GroceryListDisplay: React.FC<{ list: StructuredGroceryList }> = ({ list }) => (
    <div className="mt-6 p-4 bg-gray-900/40 rounded-lg border border-gray-700 space-y-6">
        <div>
            <h5 className="font-bold text-white text-lg mb-4">Grocery List & Price Estimates</h5>
            <div className="space-y-6">
                {list.categories.map((category) => (
                    <div key={category.category}>
                        <h6 className="font-semibold text-red-400 border-b border-gray-600 pb-2 mb-3">{category.category}</h6>
                        <div className="space-y-4">
                            {category.items.map((item, i) => (
                                <div key={i} className="p-3 bg-gray-800/50 rounded-md">
                                    <p className="font-bold text-gray-200">{item.name} <span className="text-gray-400 font-normal">({item.quantity})</span></p>
                                    <ul className="mt-2 space-y-1 text-sm">
                                        {item.storePrices.map((sp, spi) => (
                                            <li key={spi} className="flex justify-between items-center text-gray-300">
                                                <span><i className="fa-solid fa-store mr-2 text-gray-500"></i>{sp.storeName}</span>
                                                <span className="font-mono text-gray-200 bg-gray-900/50 px-2 py-0.5 rounded">{sp.price}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h6 className="font-semibold text-red-400 mb-2">Shopping Tips</h6>
            <p className="text-sm text-gray-300 italic">{list.shoppingTips}</p>
        </div>
         <div>
            <p className="text-xs text-gray-500 italic">{list.disclaimer}</p>
        </div>
    </div>
);

export default GroceryListDisplay;
