import { useNavigate } from 'react-router-dom';

function NavigationButton({ to, children, className }) {
    const navigate = useNavigate();

    return (
        <button
            type="button"
            className={className}
            onClick={() => navigate(to)}
        >
            {children}
        </button>
    );
}

export default NavigationButton;