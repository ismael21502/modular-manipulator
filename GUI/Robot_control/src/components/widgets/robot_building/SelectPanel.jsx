import Select from "./Select";
import BuildCard from "./BuildCard.jsx";

function SelectPanel({ step, wizardState, onSelectOption }) {
    return (
        <Select title={step.content.label}>
            <div className="w-full grid grid-cols-3 gap-4">
                {step.content.options.map((option, index) => (
                    <BuildCard
                        key={index}
                        label={option.label}
                        imgSrc={option.img}
                        onClick={() => onSelectOption(option.id)}
                        isActive={wizardState[step.id] === option.id}
                    />
                ))}
            </div>
        </Select>
    )
}

export default SelectPanel;
